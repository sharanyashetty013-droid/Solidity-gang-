// ───────── POST /api/compare (Real Gemini Vision) ─────────
  r.post('/compare', asyncH(async (req, res) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new AppError(503, 'ai_not_configured', 'GEMINI_API_KEY is missing in backend/.env');
    
    const id = parseId(String((req.body || {}).agreementId ?? ''));
    const signature = req.get('x-signature');
    const expires = req.get('x-expires');
    if (!signature || !expires) throw unauthorized('signature_required', 'X-Signature and X-Expires headers are required');
    assertExpiry(expires, config.viewMaxLifetimeSec);
    const signer = recover(viewMessage({ agreementId: id, cid: 'ai-compare', expires: String(expires) }), String(signature));

    const agreement = await chain.getAgreement(id);
    let allowed = sameAddr(signer, agreement.tenant) || sameAddr(signer, agreement.landlord);
    if (!allowed && agreement.state === 'Disputed') allowed = sameAddr(signer, await chain.getArbiter());
    if (!allowed) throw forbidden('not_allowed', 'Only the tenant, landlord or arbiter can run the AI check');

    const events = await chain.getEvidence(id);
    const withType = events.map((e) => ({ ...e, type: e.type || (store.getEvidence(id, e.cid) || {}).type }));
    const moveIn = withType.find((e) => e.type === 'move-in');
    const moveOut = [...withType].reverse().find((e) => e.type === 'move-out');
    if (!moveIn || !moveOut) throw conflict('need_both_photos', 'Need one move-in and one move-out photo to compare');

    const load = async (ev) => {
      const photo = decrypt(await ipfs.get(ev.cid), config.encryptionKey, id);
      if (sha256Hex(photo) !== ev.hash.toLowerCase()) throw new AppError(502, 'hash_mismatch', 'Photo does not match the on-chain hash');
      return photo.toString('base64');
    };
    const [inB64, outB64] = [await load(moveIn), await load(moveOut)];
    console.log('GEMINI_DEBUG photo sizes KB (base64):', Math.round(inB64.length / 1024), Math.round(outB64.length / 1024));

    const prompt = [
      'You compare two photos of the same rental room. Image 1 is MOVE-IN. Image 2 is MOVE-OUT.',
      'List only physical differences in the room: damage, stains, marks, scratches, cracks, missing or broken items.',
      'Ignore lighting, camera angle and color differences.',
      'Reply ONLY as JSON: {"sameRoom": boolean, "summary": string, "differences": [{"area": string, "description": string, "severity": "minor"|"moderate"|"major"}]}.',
      'If nothing changed, return an empty differences list. You only flag differences; a human makes the final decision.',
    ].join(' ');

    const body = JSON.stringify({
      contents: [{ parts: [
        { text: prompt },
        { inline_data: { mime_type: 'image/jpeg', data: inB64 } },
        { inline_data: { mime_type: 'image/jpeg', data: outB64 } },
      ] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    });

    // Automatically discover available models for this API key
    let models = [];
    try {
      const lr = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
        headers: { 'x-goog-api-key': key },
        signal: AbortSignal.timeout(15000),
      });
      const ld = await lr.json();
      models = (ld.models || [])
        .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')
          && /flash/i.test(m.name)
          && !/(image|tts|live|audio|embedding|thinking|exp|preview)/i.test(m.name))
        .map((m) => m.name.replace('models/', ''));
    } catch (e) { 
      console.error('GEMINI_DEBUG list models failed', e?.message); 
    }
    
    if (!models.length) models = ['gemini-flash-latest', 'gemini-1.5-flash'];
    models = models.slice(0, 5);
    console.log('GEMINI_DEBUG models to try:', models.join(', '));

    let resp;
    let lastErrorText = '';
    for (const model of models) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
            signal: AbortSignal.timeout(45000),
            body,
          });
          if (resp.ok) break;
          lastErrorText = await resp.text().catch(() => '');
          console.error(`GEMINI_DEBUG model ${model} attempt ${attempt + 1} status ${resp.status}:`, lastErrorText.slice(0, 200));
          if (![429, 500, 503].includes(resp.status)) break;
        } catch (err) {
          console.error(`GEMINI_DEBUG model ${model} fetch error:`, err?.message);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      if (resp && resp.ok) break;
    }

    if (!resp || !resp.ok) {
      throw new AppError(502, 'ai_failed', 'The AI service is busy or rate-limited right now. Please wait 30 seconds and try again.');
    }

    const data = await resp.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    let result;
    try { 
      result = JSON.parse(text.replace(/```json|```/g, '').trim()); 
    } catch { 
      throw new AppError(502, 'ai_bad_output', 'AI returned an unreadable answer, try again'); 
    }

    res.json({ agreementId: id, moveInCid: moveIn.cid, moveOutCid: moveOut.cid, result });
  }));
