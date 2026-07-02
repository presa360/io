/* Services variants 6–9 */

// V6 — Две колонки: преимущества + результаты
function V6(){
  return (
    <SlideFrame index="06" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v6-wrap">
        <div className="v6-list">
          {SERVICES.map((s,i)=>(
            <div className="v6-row" key={i}>
              <div className="v6-tick"><Icon name="check" size={15} stroke={2.6}/></div>
              <div>
                <div className="v6-rt">{s.title}</div>
                <div className="v6-rd">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="v6-panel">
          <div className="v6-pt">Результат для вас</div>
          <div className="v6-stats">
            <div className="v6-stat">
              <div className="v6-num">−80%</div>
              <div className="v6-lab">времени на создание презентаций</div>
            </div>
            <div className="v6-stat">
              <div className="v6-num">+50%</div>
              <div className="v6-lab">качества визуальной коммуникации</div>
            </div>
            <div className="v6-stat wide">
              <div className="v6-num">100%</div>
              <div className="v6-lab">единый стиль во всех материалах</div>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

// V7 — Блоки с акцентным цветом
function V7(){
  return (
    <SlideFrame index="07" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v7-grid">
        {SERVICES.map((s,i)=>(
          <div className={"v7-card "+(i<3?"red":"dark")} key={i}>
            <div className="svc-icon-badge"><Icon name={s.icon} size={24}/></div>
            <div className="v7-h">{s.title}</div>
            <div className="v7-d">{s.desc}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

// V8 — Процесс / как это работает
const STEPS = [
  { n:"01", t:"Выбираете шаблон",     d:"Подходящий дизайн под вашу задачу" },
  { n:"02", t:"Заполняете контент",   d:"Текст, данные и изображения" },
  { n:"03", t:"AI улучшает структуру",d:"Формулировки, логика, визуальная подача" },
  { n:"04", t:"Экспортируете PPTX",   d:"Готовая презентация в один клик" },
];
function Arrow(){
  return (
    <svg viewBox="0 0 80 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 8h70"/><path d="M66 3l6 5-6 5"/>
    </svg>
  );
}
function V8(){
  return (
    <SlideFrame index="08" total="09">
      <div className="sv-title">Как это работает</div>
      <div className="v8-row">
        {STEPS.map((s,i)=>(
          <React.Fragment key={i}>
            <div className={"v8-step"+(i===2?" active":"")}>
              <div className="v8-num">{s.n}</div>
              <div className="v8-h">{s.t}</div>
              <div className="v8-d">{s.d}</div>
            </div>
            {i<STEPS.length-1 && <div className="v8-arrow"><Arrow/></div>}
          </React.Fragment>
        ))}
      </div>
    </SlideFrame>
  );
}

// V9 — Табличный / сравнение
const ROWS = [
  { f:"Готовые шаблоны",            p:"yes", o:"mid", m:"no" },
  { f:"AI-помощник",               p:"yes", o:"mid", m:"no" },
  { f:"Быстрая подготовка",        p:"yes", o:"mid", m:"no" },
  { f:"Единый корпоративный стиль",p:"yes", o:"mid", m:"no" },
  { f:"Экспорт в PPTX",            p:"yes", o:"yes", m:"yes" },
  { f:"Библиотека контента",       p:"yes", o:"mid", m:"no" },
];
function Mark({ kind }){
  if(kind==="yes") return <span className="v9-ck yes"><Icon name="check" size={19} stroke={2.6}/></span>;
  if(kind==="mid") return <span className="v9-ck mid"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="7"/></svg></span>;
  return <span className="v9-ck no"><Icon name="cross" size={18} stroke={2.4}/></span>;
}
function V9(){
  return (
    <SlideFrame index="09" total="09">
      <div className="sv-title">Что входит в наши услуги</div>
      <table className="v9-table">
        <thead>
          <tr>
            <th style={{width:"40%"}}>Возможности</th>
            <th className="center v9-th-presa">Presa</th>
            <th className="center">Другие решения</th>
            <th className="center">Ручная работа</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r,i)=>(
            <tr key={i}>
              <td className="feat">{r.f}</td>
              <td className="center v9-col-presa"><Mark kind={r.p}/></td>
              <td className="center"><Mark kind={r.o}/></td>
              <td className="center"><Mark kind={r.m}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </SlideFrame>
  );
}

Object.assign(window,{ V6,V7,V8,V9 });
