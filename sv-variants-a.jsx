/* Services variants 1–5 */

// V1 — Карточки (классический)
function V1(){
  return (
    <SlideFrame index="01" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v1-grid">
        {SERVICES.map((s,i)=>(
          <div className="v1-card" key={i}>
            <div className="svc-icon-badge badge-tint"><Icon name={s.icon} size={26}/></div>
            <div>
              <div className="v1-h">{s.title}</div>
            </div>
            <div className="v1-d">{s.desc}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

// V2 — Список с акцентами
function V2(){
  return (
    <SlideFrame index="02" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v2-wrap">
        <div className="v2-list">
          {SERVICES.map((s,i)=>(
            <div className="v2-row" key={i}>
              <div className="svc-icon-badge badge-tint"><Icon name={s.icon} size={22}/></div>
              <div>
                <div className="v2-rt">{s.title}</div>
                <div className="v2-rd">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="v2-panel">
          <div className="pico"><Icon name="layers" size={38} stroke={1.8}/></div>
          <div className="v2-pt">Все инструменты<br/>в одной системе<br/>для создания сильных<br/>презентаций</div>
          <div className="v2-pl"></div>
        </div>
      </div>
    </SlideFrame>
  );
}

// V3 — Флагман + дополнительные
function V3(){
  const extra = [SERVICES[0], SERVICES[1], SERVICES[4], SERVICES[5]];
  return (
    <SlideFrame index="03" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v3-wrap">
        <div className="v3-hero">
          <div className="hico"><Icon name="bolt" size={28}/></div>
          <div>
            <div className="v3-ht">Скорость</div>
            <div className="v3-hd">Готовая презентация за минуты. Создавайте профессиональные презентации быстрее, чем когда-либо.</div>
          </div>
        </div>
        {extra.map((s,i)=>(
          <div className="v3-card" key={i}>
            <div className="svc-icon-badge badge-tint"><Icon name={s.icon} size={22}/></div>
            <div className="v3-h">{s.title}</div>
            <div className="v3-d">{s.desc}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

// V4 — Иконки в строку (минимализм)
function V4(){
  return (
    <SlideFrame index="04" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v4-row">
        {SERVICES.map((s,i)=>(
          <React.Fragment key={i}>
            <div className="v4-item">
              <div className="svc-icon-badge badge-soft"><Icon name={s.icon} size={28}/></div>
              <div className="v4-h">{s.title}</div>
              <div className="v4-d">{s.desc}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </SlideFrame>
  );
}

// V5 — С фото / визуалами
function V5(){
  return (
    <SlideFrame index="05" total="09">
      <div className="sv-title">Что мы предлагаем</div>
      <div className="v5-row">
        {SERVICES.map((s,i)=>(
          <div className="v5-card" key={i}>
            <div className="v5-photo">
              <div className="ph-grid"></div>
              <div className="ph-glow"></div>
              <div className="ph-ic"><Icon name={s.icon} size={40} stroke={1.6}/></div>
            </div>
            <div className="v5-fab"><Icon name={s.icon} size={18}/></div>
            <div className="v5-h">{s.title}</div>
            <div className="v5-d">{s.desc}</div>
          </div>
        ))}
      </div>
    </SlideFrame>
  );
}

Object.assign(window,{ V1,V2,V3,V4,V5 });
