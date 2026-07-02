/* Mount the design canvas with all 9 service-slide variants */
const VARIANTS = [
  { id:"v1", label:"1 · Карточки (классический)",            C:V1 },
  { id:"v2", label:"2 · Список с акцентами",                 C:V2 },
  { id:"v3", label:"3 · Флагман + дополнительные",           C:V3 },
  { id:"v4", label:"4 · Иконки в строку (минимализм)",       C:V4 },
  { id:"v5", label:"5 · С фото / визуалами",                 C:V5 },
  { id:"v6", label:"6 · Две колонки: преимущества + результаты", C:V6 },
  { id:"v7", label:"7 · Блоки с акцентным цветом",           C:V7 },
  { id:"v8", label:"8 · Процесс / как это работает",         C:V8 },
  { id:"v9", label:"9 · Табличный / сравнение",              C:V9 },
];

function App(){
  return (
    <DesignCanvas>
      <DCSection id="services" title="Наши услуги / Продукт / Возможности"
        subtitle="9 вариантов слайда «Что мы предлагаем» в стиле Presa">
        {VARIANTS.map(v=>(
          <DCArtboard id={v.id} label={v.label} width={1280} height={720} key={v.id}>
            <v.C/>
          </DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
