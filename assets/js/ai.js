/* ============================================================
   ai.js — Kết nối Anthropic API (Claude) từ trình duyệt
   ------------------------------------------------------------
   • API key do người dùng nhập trong Cài đặt, CHỈ lưu localStorage.
   • Gọi thẳng https://api.anthropic.com/v1/messages với header
     anthropic-dangerous-direct-browser-access (CORS cho web tĩnh).
   • Model mặc định: claude-sonnet-4-6 (đổi được trong Cài đặt).
   ============================================================ */
(function (global) {
  "use strict";

  const API_URL = "https://api.anthropic.com/v1/messages";

  function ready() { return !!(Store.settings().apiKey || "").trim(); }
  function model() { return Store.settings().aiModel || "claude-sonnet-4-6"; }

  // Cắt cửa sổ hội thoại hợp lệ cho Messages API: tối đa 16 lượt gần nhất,
  // bắt đầu bằng user, vai xen kẽ (gộp các lượt cùng vai liên tiếp — xảy ra
  // khi một request trước đó lỗi và không có câu trả lời của assistant).
  function sanitizeMessages(messages) {
    const win = messages.slice(-16);
    while (win.length && win[0].role !== "user") win.shift();
    const out = [];
    win.forEach((m) => {
      const last = out[out.length - 1];
      if (last && last.role === m.role) last.content += "\n" + m.content;
      else out.push({ role: m.role, content: m.content });
    });
    return out;
  }

  // messages: [{role:"user"|"assistant", content:"..."}]
  async function chat(messages, system, maxTokens) {
    const key = (Store.settings().apiKey || "").trim();
    if (!key) throw new Error("Chưa có API key. Vào Cài đặt → nhập Anthropic API key.");
    const msgs = sanitizeMessages(messages);
    if (!msgs.length) throw new Error("Không có nội dung để gửi");
    let res;
    try {
      res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: model(),
          max_tokens: maxTokens || 1500,
          system: system || undefined,
          messages: msgs,
        }),
      });
    } catch (e) {
      throw new Error("Không kết nối được API (mạng/chặn CORS). Kiểm tra internet.");
    }
    if (!res.ok) {
      let msg = "Lỗi API (" + res.status + ")";
      try {
        const err = await res.json();
        if (err && err.error && err.error.message) msg += ": " + err.error.message;
      } catch (e) {}
      if (res.status === 401) msg = "API key không hợp lệ (401). Kiểm tra lại trong Cài đặt.";
      if (res.status === 429) msg = "Vượt hạn mức API (429). Chờ một lát rồi thử lại.";
      throw new Error(msg);
    }
    const data = await res.json();
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    if (data.stop_reason === "refusal") throw new Error("AI từ chối yêu cầu này.");
    return text;
  }

  // Bóc JSON từ câu trả lời (AI có thể bọc trong ```json ... ```)
  function parseJSON(text) {
    let t = String(text).trim();
    const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) t = fence[1].trim();
    const start = t.search(/[\[{]/);
    if (start > 0) t = t.slice(start);
    try { return JSON.parse(t); } catch (e) {}
    // thử cắt tới dấu đóng cuối cùng
    const endObj = Math.max(t.lastIndexOf("}"), t.lastIndexOf("]"));
    if (endObj > 0) { try { return JSON.parse(t.slice(0, endObj + 1)); } catch (e) {} }
    return null;
  }

  /* ---------------- Prompt hồ sơ người học ---------------- */
  function learnerProfile() {
    const s = Store.settings();
    return "LEARNER PROFILE: Vietnamese male, 42, public-sector manager (economics PhD). " +
      "Current level: CEFR A2 (TOEIC ~350) working toward B2 speaking/listening in his narrow field. " +
      "Field: economic management, public administration, public policy, digital government. " +
      (s.topic ? ("Thesis topic: " + s.topic + ". ") : "") +
      "He is preparing to present his dissertation in English and answer committee questions.";
  }

  /* ---------------- Module 4: Speaking Coach ---------------- */
  function coachSystem(mode) {
    const base = learnerProfile() +
      "\nYou are an experienced EAP (English for Academic Purposes) speaking coach." +
      "\nRules: keep replies SHORT (3-6 sentences of English at CEFR B1 level so he can follow)." +
      " Always be encouraging but honest. Never switch to Vietnamese except inside the feedback notes marked (VN: ...).";
    if (mode === "correct") return base +
      "\nMODE - ERROR CORRECTION: The user speaks; you must (1) briefly react to the content, " +
      "(2) list up to 3 errors as bullet lines: '✗ wrong → ✓ corrected (VN: giải thích ngắn bằng tiếng Việt)', " +
      "(3) give ONE more formal/academic way to phrase his main idea, then (4) ask one follow-up question to keep him speaking.";
    if (mode === "committee") return base +
      "\nMODE - COMMITTEE ROLE-PLAY: You are a professor on his dissertation committee. " +
      "Ask ONE challenging but fair question at a time about his research (method, data, novelty, limitations, theory, contribution, applications, future work). " +
      "After he answers, give a one-sentence reaction, then ask the next question. Occasionally ask him to clarify or push back politely.";
    return base +
      "\nMODE - CONVERSATION: Hold a natural academic conversation about his work and field. " +
      "Ask one question at a time. Gently recast (repeat correctly) anything he says wrong, without listing errors.";
  }

  /* ---------------- Module 5: Defense Simulator ---------------- */
  function genQuestionsPrompt(summary, count, level) {
    return "Here is the abstract/summary of my dissertation (may be in Vietnamese):\n---\n" + summary +
      "\n---\nGenerate exactly " + (count || 8) + " oral-defense questions in English that a Vietnamese state-level academic committee would ask." +
      "\nDifficulty: " + (level || "mixed, from easier to harder") + "." +
      "\nCover different types: method, data, novelty, limitations, practical application, theoretical framework, contribution, future work." +
      "\nReturn ONLY a JSON array, each item: {\"type\": \"method|data|novelty|limits|practice|theory|contribution|future\", \"q\": \"question in English\", \"vi\": \"bản dịch tiếng Việt của câu hỏi\", \"hint\": \"gợi ý khung trả lời ngắn bằng tiếng Việt\"}";
  }

  function scoreAnswerPrompt(question, answerTranscript) {
    return learnerProfile() +
      "\nDEFENSE PRACTICE - score one answer. Committee question: \"" + question + "\"" +
      "\nThe candidate's spoken answer (speech-to-text transcript, so ignore small transcription noise):\n---\n" +
      (answerTranscript || "(no answer)") +
      "\n---\nScore 1-10 on five criteria and give feedback. Return ONLY JSON: " +
      "{\"scores\": {\"content\": n, \"fluency\": n, \"pron\": n, \"vocab\": n, \"strategy\": n}, " +
      "\"comment\": \"3-4 câu nhận xét bằng TIẾNG VIỆT, cụ thể\", " +
      "\"improvements\": [\"việc cần cải thiện 1 (tiếng Việt)\", \"việc 2\", \"việc 3\"], " +
      "\"betterAnswer\": \"a model answer in English, 4-6 sentences, CEFR B1-B2\"}" +
      "\nNote: 'pron' can only be judged roughly from transcript coherence; 'strategy' = did he restate the question, structure the answer, handle uncertainty politely." +
      "\nScoring norm: this is an A2-B1 learner; 5 = acceptable for his level, 8+ = defense-ready.";
  }

  function scoreSessionPrompt(pairs) {
    // pairs: [{q, a}]
    return learnerProfile() +
      "\nFULL MOCK DEFENSE - score the whole Q&A session (" + pairs.length + " questions)." +
      "\nTranscript:\n" + pairs.map((p, i) => "Q" + (i + 1) + ": " + p.q + "\nA" + (i + 1) + ": " + (p.a || "(no answer)")).join("\n") +
      "\nReturn ONLY JSON: {\"scores\": {\"content\": n, \"fluency\": n, \"pron\": n, \"vocab\": n, \"strategy\": n}, " +
      "\"comment\": \"nhận xét tổng thể 4-6 câu bằng TIẾNG VIỆT\", " +
      "\"improvements\": [\"3 việc cần cải thiện, tiếng Việt\"]}";
  }

  global.AI = { ready, model, chat, parseJSON, coachSystem, genQuestionsPrompt, scoreAnswerPrompt, scoreSessionPrompt, learnerProfile };
})(window);
