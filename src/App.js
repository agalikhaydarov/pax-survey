import { useState } from "react";

// ─── ВСТАВЬ СВОИ ДАННЫЕ ЗДЕСЬ ───────────────────────────────────────────────
const AIRTABLE_TOKEN = "ТВОЙ_ТОКЕН";
const AIRTABLE_BASE  = "appweX4l7UHT1EJJD";
const AIRTABLE_TABLE = "Ответы";
// ────────────────────────────────────────────────────────────────────────────

const ALL_STEPS = [
  {
    id: "intro", block: "Вводный блок", title: "Немного о вас", caregiver: false,
    questions: [
      { id: "drugs",  type: "radio", text: "Сколько препаратов в вашей схеме?", opts: ["1–3","4–6","7–10","Больше 10"] },
      { id: "tenure", type: "radio", text: "Как давно вы пользуетесь PAX?",     opts: ["Меньше месяца","1–3 месяца","Больше 3 месяцев"] },
      { id: "who",    type: "radio", text: "Кто принимает лекарства?",           opts: ["Я сам","Я забочусь о близком","Оба"] },
    ],
  },
  {
    id: "caregiver", block: "Ветка — уход за близким", title: "Расскажите подробнее", caregiver: true,
    questions: [
      { id: "c_live",    type: "radio", text: "Вы живёте вместе с этим человеком?",                                          opts: ["Да","Нет, помогаю дистанционно"] },
      { id: "c_control", type: "radio", text: "Как вы контролируете, что близкий принял лекарства?",                         opts: ["Звоню или пишу","Приезжаю","Никак, на доверии","PAX снял эту проблему"] },
      { id: "c_before",  type: "radio", text: "До PAX случалось, что близкий принял не то или пропустил приём?",             opts: ["Да, несколько раз","Однажды было","Нет, не случалось"] },
    ],
  },
  {
    id: "adherence", block: "Блок 1", title: "Приём лекарств", caregiver: false,
    questions: [
      { id: "skip",  type: "radio", textSelf: "Стали ли вы пропускать приёмы реже с PAX?", textCare: "Стал ли ваш близкий пропускать приёмы реже с PAX?", opts: ["Да, значительно реже","Да, немного реже","Примерно так же","Нет"] },
      { id: "doubt", type: "radio", text: "Бывало ли, что вы смотрели на таблетки и думали: «я уже принял или нет?»",       opts: ["Да, регулярно","Иногда","Крайне редко","Нет, такого не было"] },
    ],
  },
  {
    id: "service", block: "Блок 2", title: "Сервис", caregiver: false,
    questions: [
      { id: "speed",    type: "radio", text: "Сколько времени прошло от оформления заказа до получения?", opts: ["1–2 дня","3–5 дней","Больше недели"] },
      { id: "speed_ok", type: "radio", text: "Этот срок для вас:",                                        opts: ["Приемлемо","Хотелось бы быстрее","Критично долго"] },
      { id: "sachet",   type: "radio", text: "Насколько удобно вскрывать саше?",                          opts: ["Легко, без усилий","Нормально","Неудобно, нужны ножницы"] },
    ],
  },
  {
    id: "value", block: "Блок 3", title: "Ценность", caregiver: false,
    questions: [
      { id: "main_value", type: "chip",  text: "Что для вас главное в PAX? (можно выбрать несколько)",      opts: ["Не путаюсь в схеме","Удобно брать с собой","Экономия времени","Спокойствие — всё правильно"] },
      { id: "churn",      type: "radio", text: "Из-за чего вы могли бы не сделать следующий заказ?",        opts: ["Слишком дорого","Начну лучше справляться сам","Схема лечения изменится","Технические проблемы с заказом"] },
      { id: "nps",        type: "nps",   text: "Насколько вероятно, что вы порекомендуете PAX другу или знакомому?" },
    ],
  },
  {
    id: "open", block: "Блок 4", title: "Открытые вопросы", caregiver: false,
    questions: [
      { id: "friction", type: "text", text: "Что в процессе вас затруднило или показалось неудобным — даже мелочь?", placeholder: "Слово «мелочь» тут важно — небольшие неудобства нас интересуют больше всего" },
      { id: "missing",  type: "text", text: "Чего не хватает, чтобы PAX стал для вас незаменимым?",                  placeholder: "Свободный ответ — любые мысли" },
    ],
  },
];

function RadioOpt({ label, selected, onClick }) {
  const s = selected === label;
  return (
    <button onClick={() => onClick(label)} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 13px", borderRadius:10, border:`1px solid ${s?"#1A5F8C":"#C8DFEF"}`, background:s?"#EBF4FB":"#fff", cursor:"pointer", textAlign:"left", marginBottom:7, width:"100%", fontFamily:"inherit" }}>
      <div style={{ width:16, height:16, borderRadius:"50%", border:`1.5px solid ${s?"#1A5F8C":"#C8DFEF"}`, background:s?"#1A5F8C":"transparent", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {s && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }} />}
      </div>
      <span style={{ fontSize:13, color:s?"#1A5F8C":"#0D3A52", fontWeight:s?"500":"400" }}>{label}</span>
    </button>
  );
}

function NPS({ value, onChange }) {
  return (
    <div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
        {[0,1,2,3,4,5,6,7,8,9,10].map(v => {
          const s = value === v;
          let bg="#fff", border="#C8DFEF", color="#0D3A52";
          if (s) {
            if (v<=6)      { bg="#FCEBEB"; border="#E24B4A"; color="#A32D2D"; }
            else if (v<=8) { bg="#FAEEDA"; border="#BA7517"; color="#854F0B"; }
            else           { bg="#EBF4FB"; border="#1A5F8C"; color="#1A5F8C"; }
          }
          return <button key={v} onClick={() => onChange(v)} style={{ width:38, height:38, borderRadius:8, border:`1px solid ${border}`, background:bg, color, fontSize:13, fontWeight:"500", cursor:"pointer", fontFamily:"inherit" }}>{v}</button>;
        })}
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
        <span style={{ fontSize:11, color:"#9BBFD4" }}>Точно не порекомендую</span>
        <span style={{ fontSize:11, color:"#9BBFD4" }}>Обязательно порекомендую</span>
      </div>
    </div>
  );
}

export default function Survey() {
  const [step, setSt] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);

  const isCaregiver = answers["who"] === "Я забочусь о близком" || answers["who"] === "Оба";
  const visible = ALL_STEPS.filter(s => !s.caregiver || isCaregiver);
  const cur = visible[step];
  const total = visible.length;

  const set = (id, val) => setAnswers(a => ({ ...a, [id]: val }));
  const toggle = (id, val) => {
    const prev = answers[id] || [];
    set(id, prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const isValid = () => cur.questions.every(q => {
    if (q.type === "text") return true;
    if (q.type === "chip") return (answers[q.id] || []).length > 0;
    return answers[q.id] !== undefined;
  });

  const handleSubmit = async () => {
    setSending(true);
    setError(false);
    try {
      const fields = { ...answers };
      if (Array.isArray(fields.main_value)) fields.main_value = fields.main_value.join(", ");
      const res = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        }
      );
      if (!res.ok) throw new Error("error");
      setDone(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  if (done) return (
    <div style={{ minHeight:"100vh", background:"#EBF4FB", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ width:64, height:64, borderRadius:"50%", background:"#EBF4FB", border:"1px solid #7BBDE0", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:28, color:"#1A5F8C" }}>✓</div>
        <div style={{ fontSize:20, fontWeight:"500", color:"#0D3A52", marginBottom:8 }}>Спасибо за честные ответы</div>
        <div style={{ fontSize:14, color:"#5A8FAA", lineHeight:1.6 }}>Каждый ответ мы читаем лично.<br/>Это помогает нам делать PAX лучше для вас.</div>
      </div>
    </div>
  );

  const pct = Math.round((step / total) * 100);

  return (
    <div style={{ minHeight:"100vh", background:"#EBF4FB", padding:"24px 16px 48px" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>

        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:32, fontWeight:"700", color:"#0D3A52", letterSpacing:"-0.5px", lineHeight:1 }}>PAX</div>
          <div style={{ fontSize:14, fontWeight:"600", color:"#5A8FAA", marginTop:6, lineHeight:1.4 }}>аптека с персональной упаковкой ваших лекарств</div>
        </div>

        <div style={{ height:3, background:"#C8DFEF", borderRadius:2, marginBottom:24 }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"#1A5F8C", borderRadius:2, transition:"width 0.4s ease" }} />
        </div>

        <div style={{ fontSize:11, color:"#9BBFD4", textAlign:"right", marginBottom:8 }}>Шаг {step+1} из {total}</div>
        <div style={{ fontSize:11, color:"#5A8FAA", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:4, fontWeight:"500" }}>{cur.block}</div>
        <div style={{ fontSize:20, fontWeight:"500", color:"#0D3A52", marginBottom:20 }}>{cur.title}</div>

        {cur.caregiver && (
          <div style={{ fontSize:12, color:"#5A8FAA", padding:"7px 12px", background:"#EBF4FB", borderRadius:8, borderLeft:"2px solid #7BBDE0", marginBottom:16 }}>
            → Этот блок — для тех, кто заботится о близком
          </div>
        )}

        {cur.questions.map(q => {
          const text = q.textSelf ? (isCaregiver && q.textCare ? q.textCare : q.textSelf) : q.text;
          return (
            <div key={q.id} style={{ background:"#fff", borderRadius:14, border:"1px solid #C8DFEF", padding:"16px 18px", marginBottom:10 }}>
              <div style={{ fontSize:14, fontWeight:"500", color:"#0D3A52", marginBottom:12, lineHeight:1.5 }}>{text}</div>

              {q.type === "radio" && q.opts.map(o => <RadioOpt key={o} label={o} selected={answers[q.id]} onClick={v => set(q.id, v)} />)}

              {q.type === "chip" && (
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {q.opts.map(o => {
                    const s = (answers[q.id] || []).includes(o);
                    return <button key={o} onClick={() => toggle(q.id, o)} style={{ padding:"8px 14px", borderRadius:20, border:`1px solid ${s?"#1A5F8C":"#C8DFEF"}`, background:s?"#EBF4FB":"#fff", color:s?"#1A5F8C":"#0D3A52", fontSize:13, fontWeight:s?"500":"400", cursor:"pointer", fontFamily:"inherit" }}>{o}</button>;
                  })}
                </div>
              )}

              {q.type === "nps" && <NPS value={answers[q.id]} onChange={v => set(q.id, v)} />}

              {q.type === "text" && (
                <textarea rows={3} placeholder={q.placeholder} value={answers[q.id] || ""} onChange={e => set(q.id, e.target.value)}
                  style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #C8DFEF", fontSize:13, color:"#0D3A52", fontFamily:"inherit", resize:"vertical", outline:"none", background:"#fff", lineHeight:1.5, boxSizing:"border-box" }} />
              )}
            </div>
          );
        })}

        {error && (
          <div style={{ fontSize:13, color:"#A32D2D", background:"#FCEBEB", borderRadius:10, padding:"10px 14px", marginTop:8 }}>
            Не удалось отправить ответы. Проверьте соединение и попробуйте ещё раз.
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginTop:12 }}>
          {step > 0 && (
            <button onClick={() => setSt(s => s-1)} style={{ padding:"11px 18px", borderRadius:10, border:"1px solid #C8DFEF", background:"transparent", color:"#5A8FAA", fontSize:13, fontWeight:"500", cursor:"pointer", fontFamily:"inherit" }}>
              ← Назад
            </button>
          )}
          <button
            onClick={() => { if (step < total-1) setSt(s => s+1); else handleSubmit(); }}
            disabled={!isValid() || sending}
            style={{ flex:1, padding:"11px 18px", borderRadius:10, border:"none", background:isValid()&&!sending?"#1A5F8C":"#C8DFEF", color:isValid()&&!sending?"#fff":"#9BBFD4", fontSize:13, fontWeight:"500", cursor:isValid()&&!sending?"pointer":"not-allowed", fontFamily:"inherit", transition:"background 0.2s" }}>
            {sending ? "Отправляем..." : step === total-1 ? "Отправить ответы" : "Далее →"}
          </button>
        </div>

        <div style={{ textAlign:"center", fontSize:11, color:"#9BBFD4", marginTop:16 }}>
          Ответы анонимны и используются только для улучшения сервиса
        </div>
      </div>
    </div>
  );
}
