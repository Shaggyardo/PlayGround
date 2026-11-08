(() => {
  const $ = id => document.getElementById(id);
  const roman = ['I','II','III','IV','V','VI','VII','VIII'];
  const shopStops = [0, 2, 4, 6];
  const classes = {
    asesino: {name:'Asesino', aliases:'Cazador · Pícaro · Arquero', hp:8, sanity:7, gold:12, damage:2, ability:'Ataque furtivo', abilityText:'Una vez por combate, inflige 4 de daño.', icon:'➶'},
    caballero: {name:'Caballero', aliases:'Berserker · Paladín · Guerrero', hp:10, sanity:6, gold:10, damage:3, ability:'Muro de hierro', abilityText:'Una vez por combate, recupera 2 de vida y reduce el próximo golpe en 2.', icon:'♜'},
    mago: {name:'Mago', aliases:'Hechicero · Brujo · Druida', hp:7, sanity:9, gold:12, damage:2, ability:'Descarga arcana', abilityText:'Una vez por combate, gasta 1 de cordura para infligir 4 de daño.', icon:'✧'}
  };
  const shopGoods = {
    asesino: [
      {id:'potion',type:'Poción',name:'Poción de sangre',icon:'♥',price:3,desc:'Recupera 3 de vida. Máximo: 3.'},
      {id:'tonic',type:'Poción',name:'Sales de lucidez',icon:'◉',price:3,desc:'Recupera 3 de cordura. Máximo: 3.'},
      {id:'weapon',name:'Daga de monte',icon:'†',price:5,desc:'Arma: inflige 4 de daño por ataque.',damage:4},
      {id:'armor',name:'Cuero de acechador',icon:'▤',price:6,desc:'Armadura: reduce en 1 el daño recibido.'},
      {id:'weapon2',name:'Arco de hueso negro',icon:'➶',price:10,desc:'Arma superior: inflige 5 de daño por ataque.',damage:5},
      {id:'relic',name:'Ojo del cuervo',icon:'◈',price:12,desc:'Reliquia permanente: +2 de oro al ganar cada combate.',effect:'combatGold'}
    ],
    caballero: [
      {id:'potion',type:'Poción',name:'Poción de sangre',icon:'♥',price:3,desc:'Recupera 3 de vida. Máximo: 3.'},
      {id:'tonic',type:'Poción',name:'Tónico de temple',icon:'◉',price:4,desc:'Recupera 3 de cordura. Máximo: 3.'},
      {id:'weapon',name:'Martillo de guerra',icon:'⚒',price:6,desc:'Arma: inflige 4 de daño por ataque.',damage:4},
      {id:'armor',name:'Cota de malla',icon:'▤',price:7,desc:'Armadura: reduce en 2 el daño recibido.'},
      {id:'weapon2',name:'Mandoble del verdugo',icon:'⚔',price:12,desc:'Arma superior: inflige 6 de daño por ataque.',damage:6},
      {id:'relic',name:'Corazón de hierro',icon:'♥',price:13,desc:'Reliquia permanente: aumenta tu vida máxima en 2.',effect:'maxHealth'}
    ],
    mago: [
      {id:'potion',type:'Poción',name:'Poción de sangre',icon:'♥',price:3,desc:'Recupera 3 de vida. Máximo: 3.'},
      {id:'tonic',type:'Poción',name:'Elixir de lucidez',icon:'◉',price:3,desc:'Recupera 3 de cordura. Máximo: 3.'},
      {id:'weapon',name:'Bastón de espino',icon:'ϟ',price:6,desc:'Arma: inflige 4 de daño por ataque.',damage:4},
      {id:'armor',name:'Manto de runas',icon:'▤',price:6,desc:'Armadura: reduce en 1 el daño recibido.'},
      {id:'weapon2',name:'Vara de la tormenta',icon:'ϟ',price:12,desc:'Arma superior: inflige 5 de daño por ataque.',damage:5},
      {id:'relic',name:'Semilla del aquelarre',icon:'✧',price:13,desc:'Reliquia permanente: recupera 2 de vida tras cada combate.',effect:'combatHeal'}
    ]
  };
  let state, combat=null, locked=false, toastTimer;
  const initial = () => ({classId:null,gold:12,health:8,maxHealth:8,sanity:7,step:0,flags:{},notes:[],history:[],inventory:{potion:0,tonic:0},equipment:{weapon:null,damage:0,armor:0},relics:[],visitedShops:[]});
  state = initial();
  const story = [
    {chapter:'PRÓLOGO · LA ÚLTIMA MILLA',place:'EL CAMINO DE CENIZA',type:'LA PLEGARIA DE UN EXTRAÑO',title:'La última milla',scene:'road',copy:'La lluvia azota el camino. Junto al mojón, un mensajero moribundo abraza una carta sellada. La marca de cera negra pertenece a la reina. A tu espalda, una campana tañe una vez.',memory:'El camino aún no ha aprendido tu nombre.',choices:[
      {action:'Tomar la carta',detail:'El último deseo de un moribundo podría abrirte camino.',cost:'+3 oro · −1 cordura',effect:{gold:3,sanity:-1},flag:{letter:true},note:'Tomaste la carta sellada de la reina. La cera aún estaba tibia.'},
      {action:'Dejarlo a los cuervos',detail:'Mantén las manos limpias. Sigue adelante.',cost:'+1 vida · −2 oro',effect:{health:1,gold:-2},flag:{mercy:true},note:'Dejaste al mensajero moribundo en el camino. Te vio marcharte.'}
    ]},
    {chapter:'ACTO I · LA MILLA HUECA',place:'EL PUENTE DE LOS LAMENTOS',type:'UN PEAJE DE SANGRE',title:'El guardián del puente',scene:'bridge',copy:s=>s.flags.letter?'Un cobrador con una corona de dedos bloquea el puente. Sus ojos lechosos se clavan en el sello real. «Eso pertenece a los muertos», dice. «O a mí».':'Un cobrador con una corona de dedos bloquea el puente. Bajo las tablas, el río susurra el nombre que tenías de niño. «Moneda, sangre o un secreto», grazna.',memory:s=>s.flags.letter?'La cera negra atrae miradas codiciosas.':'El río conoce un nombre que nunca le diste.',choices:[
      {action:'Pagar el peaje',detail:'Algunas puertas solo se abren con la cantidad justa de monedas.',cost:'−4 oro',effect:{gold:-4},requires:{stat:'gold',min:4,label:'4 de oro'},flag:{bridgePaid:true},note:'Pagaste al guardián. El puente te dejó pasar.'},
      {action:'Desafiar al guardián',detail:'Su corona de dedos no parece un adorno.',combat:{title:'El guardián del puente',description:'Véncelo para cruzar y obtener 2 monedas.',enemyName:'Guardián del puente',maxHp:9,enemyDamage:2,reward:2,flag:{bridgeThreat:true},note:'Venciste al guardián del puente y cruzaste entre sus dedos dispersos.'},cost:'⚔ Combate por turnos'},
      {action:'Susurrarle al río',detail:'Entrégale un recuerdo al agua. A cambio, te mostrará cómo cruzar.',cost:'−2 cordura',effect:{sanity:-2},requires:{stat:'sanity',min:6,label:'6 de cordura'},flag:{riverGift:true},note:'El río te llevó a la otra orilla y se quedó con un trozo de tu pasado.'}
    ]},
    {chapter:'ACTO I · LA MILLA HUECA',place:'LA CRIPTA DE SANTA ORRA',type:'UNA VELA EN LA OSCURIDAD',title:'Los dientes de la santa',scene:'crypt',copy:s=>s.flags.letter?'La carta palpita débilmente. La puerta de la cripta se abre a su paso. Dentro, un relicario reluce bajo un fresco de la reina llorando lágrimas negras.':'Una cripta se abre bajo un fresco de la reina llorando lágrimas negras. Algo dorado reluce entre los dientes de la santa.',memory:'Aquí enterraron a los muertos mirando en dirección contraria.',choices:[
      {action:'Saquear el relicario',detail:'El oro siempre sirve, aunque grite.',cost:'+6 oro · −2 cordura',effect:{gold:6,sanity:-2},flag:{relic:true},note:'Arrancaste los dientes de oro de la santa. Castañetearon durante todo el descenso.'},
      {action:'Sellar el umbral',detail:'Niégales público a los muertos. Llévate el silencio y vete.',cost:'+1 cordura',effect:{sanity:1},flag:{cryptSealed:true},note:'Sellaste la cripta. Algo en su interior te dio las gracias con la voz de tu madre.'},
      {action:'Beber el incienso negro',detail:'Deja que los muertos te presten su visión.',cost:'−3 vida · +2 cordura',effect:{health:-3,sanity:2},requires:{stat:'sanity',min:5,label:'5 de cordura'},flag:{deathSight:true},note:'Los muertos te mostraron un camino. Ya no recuerdas tu propio rostro.'}
    ]},
    {chapter:'ACTO II · LA CONFESIÓN ROJA',place:'LA ALDEA DE LOS CUERVOS',type:'LA DEUDA VENCE',title:'La oferta del inquisidor',scene:'village',copy:s=>s.flags.mercy?'A las puertas de la aldea, la hermana del mensajero te espera con una ballesta. Te vio abandonarlo. Antes de que dispare, un inquisidor ofrece comprarte el silencio.':'A las puertas de la aldea, un inquisidor con máscara de terciopelo ofrece monedas a cambio de un nombre. Tras él, los aldeanos cuelgan del alero de la capilla, balanceándose bajo la lluvia.',memory:'La oferta del inquisidor huele a clavo y sangre añeja.',choices:[
      {action:'Vender un nombre',detail:'Una vida a cambio de una bolsa. No hace falta decir de quién.',cost:'+5 oro · −1 cordura',effect:{gold:5,sanity:-1},flag:{inquisitorDeal:true},note:'Vendiste un nombre al inquisidor. No preguntó cómo lo conocías.'},
      {action:'Robarle la bolsa y el ojo',detail:'Un trato brutal. No quedan testigos que debas conservar.',cost:'−2 vida · +4 oro',effect:{health:-2,gold:4},flag:{inquisitorRobbed:true},note:'Dejaste al inquisidor sangrando en el barro. Los cuervos te siguieron.'},
      {action:'Comprar la libertad de los aldeanos',detail:'Un gesto costoso; quizá lo recuerden.',cost:'−6 oro · +1 cordura',effect:{gold:-6,sanity:1},requires:{stat:'gold',min:6,label:'6 de oro'},flag:{villagersSaved:true},note:'Compraste la libertad de los aldeanos. Te pusieron una llave oxidada en la mano.'}
    ]},
    {chapter:'ACTO II · LA CONFESIÓN ROJA',place:'EL BOSQUE NEGRO',type:'UNA ELECCIÓN ENTRE LOS ÁRBOLES',title:'La vieja compañera',scene:'woods',copy:s=>s.flags.villagersSaved?'Una aldeana liberada te guía al bosque negro. Mara, tu antigua compañera, te espera bajo un árbol de ahorcados. «La reina está vacía. Ayúdame a acabar con ella».':'Mara sale del bosque negro. Fue tu compañera y tu escudo. Lleva la espada desenvainada. «La reina está vacía. Ayúdame a acabar con ella».',memory:'Una vez compartisteis manta y campo de batalla. Solo uno conserva el calor.',choices:[
      {action:'Apoyar a Mara',detail:'La confianza es una hoja. Espera que apunte hacia fuera.',cost:'−1 oro · +1 cordura',effect:{gold:-1,sanity:1},flag:{maraAlly:true},note:'Elegiste a Mara. Te hizo la vieja señal: dos dedos al corazón.'},
      {action:'Enfrentarte a Mara',detail:'Sin promesas. Sin cabos sueltos.',combat:{title:'Mara, tu antigua compañera',description:'Véncela; dejará caer una bolsa con 3 monedas.',enemyName:'Mara',maxHp:12,enemyDamage:3,reward:3,flag:{maraKilled:true},note:'Venciste a Mara. Cayó sin decir palabra.'},cost:'⚔ Combate por turnos'},
      {action:'Venderla a la corona',detail:'Para un inquisidor, una vieja amiga vale más viva.',cost:'+6 oro · −2 cordura',effect:{gold:6,sanity:-2},flag:{maraSold:true},note:'Vendiste a Mara. Te sostuvo la mirada mientras se cerraban los grilletes.'}
    ]},
    {chapter:'ACTO III · LA CORONA HUNDIDA',place:'LA FORTALEZA SUMERGIDA',type:'UNA PUERTA QUE RESPIRA',title:'Bajo la fortaleza hundida',scene:'keep',copy:s=>s.flags.maraAlly?'Mara encuentra una puerta sumergida bajo la fortaleza. Tras ella, una escalera desciende hacia un latido que hace temblar las piedras.':'La fortaleza hundida emerge del agua negra. Una escalera desciende bajo ella, hacia un latido que hace temblar las piedras.',memory:'El agua trepa por los muros, aunque la marea se ha retirado.',choices:[
      {action:'Forzar la puerta de hierro',detail:'Fuerza el paso antes de que el agua te deje sin aliento.',cost:'−3 vida',effect:{health:-3},flag:{gateForced:true},note:'Forzaste la puerta. La fortaleza cobró su precio en sangre.'},
      {action:'Ofrecer la carta de la reina',detail:'Un sello real quizá abra lo que el hierro no puede.',cost:'−1 cordura',effect:{sanity:-1},requires:{flag:'letter',label:'la carta de la reina'},flag:{letterBurned:true},note:'La carta ardió con llamas azules. Algo bajo tus pies susurró: «Al fin».'},
      {action:'Buscar otra entrada',detail:'Deja que la oscuridad te muestre sus viejas grietas.',cost:'−2 cordura · +2 oro',effect:{sanity:-2,gold:2},flag:{darkRoute:true},note:'Encontraste un pasadizo olvidado. Algo más también te encontró.'}
    ]},
    {chapter:'ACTO III · LA CORONA HUNDIDA',place:'EL TRONO SUMERGIDO',type:'EL ÚLTIMO TRATO',title:'Lo que desea la corona',scene:'throne',copy:s=>s.flags.letterBurned?'La reina se sienta bajo las olas, coronada de estrellas ahogadas. El humo de la carta le rodea el cuello como una soga. «Elige en qué viniste a convertirte».':'La reina se sienta bajo las olas, coronada de estrellas ahogadas. Conoce cada camino que recorriste para llegar hasta ella. «Elige en qué viniste a convertirte».',memory:s=>s.flags.maraAlly?'Mara te toma la mano izquierda. «Pase lo que pase, no dejes que se quede con tu nombre».':'Tras el trono, el mar pega su rostro al cristal.',choices:[
      {action:'Tomar la corona',detail:'Gobierna el reino maldito. Haz tuya su hambre.',cost:'−2 cordura',effect:{sanity:-2},flag:{ending:'crown'},note:'Tomaste la corona. El mar se inclinó, y con él todas las sombras.'},
      {action:'Romper las estrellas ahogadas',detail:'Haz añicos la corona y deja que la oscuridad antigua se ahogue con ella.',cost:'−2 vida · −1 cordura',effect:{health:-2,sanity:-1},flag:{ending:'break'},note:'Rompiste la corona. Por primera vez en un siglo, cambió la marea.'},
      {action:'Poner un precio nuevo',detail:'Obliga a la reina a negociar por lo único que no puede poseer.',cost:'−5 oro',effect:{gold:-5},requires:{stat:'gold',min:10,label:'10 de oro'},flag:{ending:'bargain'},note:'Compraste el amanecer de un reino con todas tus monedas.'}
    ]}
  ];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rollD20 = () => Math.floor(Math.random() * 20) + 1;
  const rollLabel = roll => roll === 20 ? '¡CRÍTICO! · 20 natural' : roll === 1 ? '¡PIFIA! · 1 natural' : `D20: ${roll}`;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const currentStory = () => story[state.step];
  const showToast = message => {
    const toast = $('toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
  };
  const setText = (id, value) => { if ($(id)) $(id).textContent = value; };
  const setHidden = (element, hidden) => element.classList.toggle('hidden', hidden);
  function updateStats() {
    setText('goldValue', state.gold);
    setText('healthValue', `${state.health}/${state.maxHealth}`);
    setText('sanityValue', state.sanity);
    const healthMeter = $('healthMeter'), sanityMeter = $('sanityMeter');
    if (healthMeter) healthMeter.style.width = `${100 * state.health / state.maxHealth}%`;
    if (sanityMeter) sanityMeter.style.width = `${10 * state.sanity}%`;
    const char = classes[state.classId];
    setText('journeyName', char ? `${char.name} · ${char.ability}` : 'Una deuda pagada con sangre');
  }
  function updateJourney() {
    const track = $('journeyTrack');
    if (track) track.innerHTML = story.map((_, i) => `<i class="journey-dot ${i < state.step ? 'done' : ''} ${i === state.step ? 'current' : ''}"></i>`).join('');
    setText('journeyCount', `${String(Math.min(state.step + 1, story.length)).padStart(2,'0')} <span>/ 08</span>`);
    const event = currentStory();
    setText('chapterLabel', event ? event.chapter : 'EPÍLOGO · EL CAMINO RECUERDA');
    setText('eventNumber', roman[state.step] || '✦');
  }
  function renderEvent() {
    if (state.step >= story.length) return showEnding();
    const event = currentStory();
    setText('artLocation', event.place);
    setText('eventType', event.type);
    setText('eventTitle', event.title);
    setText('eventCopy', typeof event.copy === 'function' ? event.copy(state) : event.copy);
    setText('memoryText', typeof event.memory === 'function' ? event.memory(state) : event.memory);
    const art = $('cardArt');
    if (art) art.dataset.scene = event.scene;
    const row = $('choiceRow');
    row.innerHTML = '';
    event.choices.forEach((choice, index) => {
      const available = canChoose(choice);
      const lowSanityLock = state.sanity <= 2 && index === event.choices.length - 1 && event.choices.length > 2 && !choice.combat;
      const button = document.createElement('button');
      button.className = `choice ${index % 2 ? 'choice-right' : 'choice-left'} ${!available || lowSanityLock ? 'choice-disabled' : ''}`;
      button.type = 'button';
      button.disabled = !available || lowSanityLock;
      button.innerHTML = `<span class="choice-key">${index + 1}</span><span class="choice-body"><span class="choice-action">${escapeHtml(choice.action)}</span><span class="choice-detail">${escapeHtml(lowSanityLock ? 'La cordura se quiebra; ya no puedes considerar esta opción.' : choice.detail)}</span><span class="choice-cost">${escapeHtml(available ? choice.cost : `Requiere ${choice.requires?.label || 'más recursos'}`)}</span></span><span class="choice-arrow">↗</span>`;
      if (!button.disabled) button.addEventListener('click', () => selectChoice(choice));
      row.appendChild(button);
    });
    updateStats();
    updateJourney();
    setText('noteCount', state.notes.length);
    renderNotes();
    updateShopButton();
  }
  function canChoose(choice) {
    if (!choice.requires) return true;
    const requirement = choice.requires;
    if (requirement.stat) return state[requirement.stat] >= requirement.min;
    if (requirement.flag) return Boolean(state.flags[requirement.flag]);
    return true;
  }
  function updateShopButton() {
    const button = $('shopButton');
    if (!button) return;
    const open = state.classId && !state.flags.runEnded && state.step < story.length && shopStops.includes(state.step);
    button.classList.toggle('shop-ready', Boolean(open));
    button.title = open ? 'Visita programada al mercader' : 'El mercader aparecerá en una parada del camino';
  }
  function enterStep() {
    if (state.health <= 0) return showEnding(true);
    if (state.step >= story.length) return showEnding();
    renderEvent();
    if (shopStops.includes(state.step) && !state.visitedShops.includes(state.step)) openShop(true);
  }
  function applyEffect(effect = {}) {
    if (effect.gold) state.gold = Math.max(0, state.gold + effect.gold);
    if (effect.health) state.health = clamp(state.health + effect.health, 0, state.maxHealth);
    if (effect.sanity) state.sanity = clamp(state.sanity + effect.sanity, 0, 10);
  }
  function selectChoice(choice) {
    if (locked || !canChoose(choice)) return;
    if (choice.combat) return startCombat(choice);
    locked = true;
    const roll = rollD20();
    const critical = roll === 20, fumble = roll === 1;
    let resultText = `${rollLabel(roll)}. `;
    if (fumble) {
      applyEffect({health:-1, gold:-1});
      resultText += 'La decisión sale mal: pierdes 1 de vida y 1 de oro; no obtienes lo que buscabas.';
      state.notes.push(`${choice.action}: pifia (1). Perdiste 1 de vida y 1 de oro; la acción fracasó.`);
    } else {
      applyEffect(choice.effect);
      if (critical) {
        applyEffect({gold:2, health:1, sanity:1});
        resultText += 'Éxito crítico: además ganas 2 de oro, recuperas 1 de vida y 1 de cordura.';
      } else {
        resultText += choice.note || 'La acción tiene éxito.';
      }
      if (choice.flag) Object.assign(state.flags, choice.flag);
      if (choice.note) state.notes.push(choice.note);
    }
    setText('rollResult', resultText);
    showToast(resultText);
    if (state.health <= 0) return showEnding(true);
    state.history.push(choice.action);
    state.step++;
    locked = false;
    enterStep();
  }
  function itemOwned(item) {
    if (item.id === 'potion' || item.id === 'tonic') return state.inventory[item.id] >= 3;
    if (item.id === 'weapon' || item.id === 'weapon2') return state.equipment.damage >= item.damage;
    if (item.id === 'armor') return state.equipment.armor >= (item.armor || (state.classId === 'caballero' ? 2 : 1));
    if (item.id === 'relic') return state.relics.includes(item.effect);
    return false;
  }
  function openShop(scheduled = false) {
    if (!state.classId) return;
    if (scheduled && !state.visitedShops.includes(state.step)) state.visitedShops.push(state.step);
    const char = classes[state.classId];
    setText('shopTitle', scheduled ? `${char.name}: provisiones para el camino` : 'El mercader de los despojos');
    setText('shopGold', state.gold);
    const items = shopGoods[state.classId];
    $('shopItems').innerHTML = items.map((item, index) => {
      const owned = itemOwned(item), affordable = state.gold >= item.price;
      return `<article class="shop-item"><div class="shop-item-icon">${item.icon}</div><div class="shop-item-copy"><span class="eyebrow">${escapeHtml(item.type || (item.id.includes('weapon') ? 'ARMA' : item.id === 'armor' ? 'ARMADURA' : 'RELIQUIA'))}</span><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.desc)}</p></div><div class="shop-item-buy"><b>${item.price} ◈</b><button type="button" data-item="${index}" ${owned || !affordable ? 'disabled' : ''}>${owned ? 'ADQUIRIDO' : affordable ? 'COMPRAR' : 'FALTA ORO'}</button></div></article>`;
    }).join('');
    $('shopItems').querySelectorAll('[data-item]').forEach(button => button.addEventListener('click', () => buyItem(items[Number(button.dataset.item)])));
    const equipment = state.equipment.weapon ? `Arma: ${state.equipment.weapon}` : 'Sin arma equipada';
    const relicText = state.relics.length ? state.relics.map(effect => items.find(i => i.effect === effect)?.name).filter(Boolean).join(', ') : 'ninguna';
    setText('inventoryText', `Pociones: ${state.inventory.potion} · Tónicos: ${state.inventory.tonic} · ${equipment} · Reliquias: ${relicText}`);
    setHidden($('shopBackdrop'), false);
    updateStats();
  }
  function closeShop() {
    setHidden($('shopBackdrop'), true);
    updateShopButton();
  }
  function buyItem(item) {
    if (!item || state.gold < item.price || itemOwned(item)) return;
    state.gold -= item.price;
    if (item.id === 'potion' || item.id === 'tonic') state.inventory[item.id]++;
    if (item.damage) { state.equipment.weapon = item.name; state.equipment.damage = item.damage; }
    if (item.id === 'armor') state.equipment.armor = state.classId === 'caballero' ? 2 : 1;
    if (item.effect) {
      state.relics.push(item.effect);
      if (item.effect === 'maxHealth') { state.maxHealth += 2; state.health = Math.min(state.maxHealth, state.health + 2); }
    }
    showToast(`${item.name} adquirido.`);
    openShop(false);
  }
  function startCombat(choice) {
    const enemy = choice.combat;
    combat = {choice, hp:enemy.maxHp, maxHp:enemy.maxHp, guarding:false, abilityUsed:false, firstStrike:true, turn:0};
    setText('combatTitle', enemy.title);
    setText('combatDescription', enemy.description);
    setText('combatLog', `${enemy.enemyName} te cierra el paso. ¿Qué harás?`);
    setHidden($('combatBackdrop'), false);
    updateCombat();
  }
  function updateCombat() {
    if (!combat) return;
    setText('combatPlayerValue', `${state.health} / ${state.maxHealth}`);
    setText('combatEnemyValue', `${combat.hp} / ${combat.maxHp}`);
    $('combatPlayerMeter').style.width = `${100 * state.health / state.maxHealth}%`;
    $('combatEnemyMeter').style.width = `${100 * combat.hp / combat.maxHp}%`;
    $('combatPotionButton').disabled = locked || state.inventory.potion < 1 || state.health >= state.maxHealth;
    $('attackButton').disabled = locked;
    $('abilityButton').disabled = locked || combat.abilityUsed || (state.classId === 'mago' && state.sanity < 1);
    $('abilityButton').textContent = classes[state.classId].ability.toLocaleUpperCase('es');
    $('guardButton').disabled = locked;
    $('fleeButton').disabled = locked;
  }
  function playerAction(action) {
    if (!combat || locked) return;
    if (action === 'ability' && combat.abilityUsed) return;
    if (action === 'ability' && state.classId === 'mago' && state.sanity < 1) return showToast('No tienes cordura suficiente para lanzar el hechizo.');
    if (action === 'potion' && (state.inventory.potion < 1 || state.health >= state.maxHealth)) return;
    locked = true;
    const roll = rollD20(), critical = roll === 20, fumble = roll === 1;
    const id = state.classId;
    let message = `${rollLabel(roll)}. `;

    if (action === 'flee') {
      if (!fumble) {
        if (critical) { state.gold++; message += 'Retirada perfecta: encuentras 1 oro al escapar.'; }
        else message += 'Te retiras del combate. La elección queda abierta.';
        setText('combatLog', message);
        updateStats();
        setHidden($('combatBackdrop'), true);
        combat = null;
        locked = false;
        showToast(message);
        return;
      }
      message += 'La huida falla y recibes 1 de daño adicional. ';
    } else if (fumble) {
      if (action === 'potion') {
        state.inventory.potion--;
        message += 'La poción se rompe sin surtir efecto. ';
      } else {
        message += 'La acción falla; recibes 1 de daño adicional. ';
      }
    } else if (action === 'attack') {
      let damage = state.equipment.damage || classes[id].damage;
      if (id === 'asesino' && combat.firstStrike) { damage += 2; combat.firstStrike = false; message += 'Ataque furtivo. '; }
      if (critical) damage *= 2;
      combat.hp = Math.max(0, combat.hp - damage);
      message += `${critical ? 'Daño máximo: ' : ''}infliges ${damage} de daño. `;
    } else if (action === 'ability') {
      if (id === 'caballero') {
        const healing = critical ? 4 : 2;
        state.health = Math.min(state.maxHealth, state.health + healing);
        combat.guarding = true;
        message += `Recuperas hasta ${healing} de vida y preparas la defensa. `;
      } else {
        if (id === 'mago') state.sanity--;
        const damage = critical ? 8 : 4;
        combat.hp = Math.max(0, combat.hp - damage);
        message += `${critical ? 'Poder crítico: ' : ''}infliges ${damage} de daño con ${classes[id].ability.toLocaleLowerCase('es')}. `;
      }
      combat.abilityUsed = true;
    } else if (action === 'guard') {
      combat.guarding = true;
      message += critical ? 'Defensa perfecta: reduces en 4 el próximo golpe. ' : 'Te preparas para recibir el golpe. ';
    } else if (action === 'potion') {
      state.inventory.potion--;
      const healing = critical ? 5 : 3;
      state.health = Math.min(state.maxHealth, state.health + healing);
      message += `La poción te devuelve hasta ${healing} de vida. `;
    }

    if (fumble) state.health = Math.max(0, state.health - 1);
    if (combat.hp <= 0) {
      setText('combatLog', `${message} ${combat.choice.combat.enemyName} cae.`);
      return finishCombat(true);
    }
    const reduction = combat.guarding ? (critical && action === 'guard' ? 4 : 2) : 0;
    combat.guarding = false;
    const enemyDamage = Math.max(0, (combat.choice.combat.enemyDamage || 2) - state.equipment.armor - reduction);
    state.health = Math.max(0, state.health - enemyDamage);
    combat.turn++;
    setText('combatLog', `${message}${combat.choice.combat.enemyName} te inflige ${enemyDamage} de daño.`);
    updateStats();
    if (state.health <= 0) return finishCombat(false);
    locked = false;
    updateCombat();
  }
  function finishCombat(victory) {
    const choice = combat.choice, enemy = choice.combat;
    if (victory) {
      state.gold += enemy.reward || 0;
      if (state.relics.includes('combatGold')) state.gold += 2;
      if (state.relics.includes('combatHeal')) state.health = Math.min(state.maxHealth, state.health + 2);
      if (choice.flag) Object.assign(state.flags, choice.flag);
      if (choice.note) state.notes.push(choice.note);
      setText('combatLog', `${enemy.enemyName} cae. Obtienes ${enemy.reward || 0} de oro.`);
      state.history.push(choice.action);
      state.step++;
      setTimeout(() => {
        setHidden($('combatBackdrop'), true);
        combat = null;
        locked = false;
        enterStep();
      }, 800);
    } else {
      setText('combatLog', 'Caes bajo el último golpe. El camino termina aquí.');
      setTimeout(() => {
        setHidden($('combatBackdrop'), true);
        combat = null;
        locked = false;
        showEnding(true);
      }, 800);
    }
  }
  function showEnding(death = false) {
    // Preserve the story ending while marking the run complete.
    const endingFlag = state.flags.ending;
    state.flags.runEnded = true;
    setText('modalTitle', death ? 'Una vida malgastada' : endingFlag === 'crown' ? 'La reina de las profundidades' : endingFlag === 'break' ? 'La marea cambia' : endingFlag === 'bargain' ? 'El precio del amanecer' : 'El camino se cierra');
    setText('modalCopy', death ? 'Tu peregrinaje termina bajo la lluvia. El reino seguirá cobrando su deuda.' : endingFlag === 'crown' ? 'Tomaste el trono y heredaste un reino que solo sabe obedecer al hambre. Tu nombre se convirtió en una nueva maldición.' : endingFlag === 'break' ? 'La corona se hizo añicos. Bajo un cielo sin estrellas, las aguas retrocedieron y los supervivientes vieron el amanecer.' : endingFlag === 'bargain' ? 'La reina aceptó tu precio. La campana volvió a sonar, esta vez para anunciar que el reino aún podía elegir.' : 'El reino te recuerda, aunque no como esperabas.');
    setText('endingSummary', `${classes[state.classId]?.name || ''} · ${state.gold} de oro · ${state.health}/${state.maxHealth} de vida · ${state.sanity} de cordura · ${state.notes.length} recuerdos`);
    setHidden($('modalBackdrop'), false);
  }
  function renderNotes() {
    const list = $('notesList');
    if (list) list.innerHTML = state.notes.length ? state.notes.map((note, i) => `<article class="note-entry"><span class="eyebrow">RECUERDO ${String(i + 1).padStart(2,'0')}</span><p>${escapeHtml(note)}</p></article>`).join('') : '<p class="empty-notes">Aún no has dejado huella en el camino.</p>';
  }
  function resetRun() {
    state = initial(); combat = null; locked = false;
    setHidden($('modalBackdrop'), true);
    setHidden($('shopBackdrop'), true);
    setHidden($('combatBackdrop'), true);
    setHidden($('classBackdrop'), false);
    $('gameShell').classList.add('awaiting-class');
    renderClassOptions();
  }
  function renderClassOptions() {
    $('classOptions').innerHTML = Object.entries(classes).map(([id, char]) => `<button class="class-option" data-class="${id}"><span class="class-icon">${char.icon}</span><span class="eyebrow">${escapeHtml(char.aliases)}</span><h2>${char.name}</h2><p>${char.abilityText}</p><span class="class-stats">VIDA ${char.hp} · CORDURA ${char.sanity} · ORO ${char.gold}</span><b class="class-select">ELEGIR CLASE ↗</b></button>`).join('');
    $('classOptions').querySelectorAll('[data-class]').forEach(button => button.addEventListener('click', () => chooseClass(button.dataset.class)));
  }
  function chooseClass(id) {
    const char = classes[id];
    if (!char) return;
    state.classId = id; state.health = state.maxHealth = char.hp; state.sanity = char.sanity; state.gold = char.gold;
    $('gameShell').classList.remove('awaiting-class');
    setHidden($('classBackdrop'), true);
    enterStep();
  }
  $('shopButton').addEventListener('click', () => {
    if (state.classId && shopStops.includes(state.step) && state.step < story.length) openShop(!state.visitedShops.includes(state.step));
    else {
      const nextStop = shopStops.find(step => step > state.step);
      showToast(`Próxima parada de mercado: ${nextStop === undefined ? 'ninguna' : `capítulo ${nextStop + 1}`}.`);
    }
  });
  $('shopClose').addEventListener('click', closeShop);
  $('shopBackdrop').addEventListener('click', event => { if (event.target === $('shopBackdrop')) closeShop(); });
  $('attackButton').addEventListener('click', () => playerAction('attack'));
  $('abilityButton').addEventListener('click', () => playerAction('ability'));
  $('guardButton').addEventListener('click', () => playerAction('guard'));
  $('combatPotionButton').addEventListener('click', () => playerAction('potion'));
  $('fleeButton').addEventListener('click', () => playerAction('flee'));
  $('restartButton').addEventListener('click', resetRun);
  $('brandHome').addEventListener('click', event => { event.preventDefault(); resetRun(); });
  $('codexButton').addEventListener('click', () => { $('notesDrawer').classList.add('open'); $('notesDrawer').setAttribute('aria-hidden','false'); renderNotes(); });
  $('drawerClose').addEventListener('click', () => { $('notesDrawer').classList.remove('open'); $('notesDrawer').setAttribute('aria-hidden','true'); });
  $('classOptions').addEventListener('click', event => { if (event.target === $('classOptions')) return; });
  $('combatBackdrop').addEventListener('click', event => { if (event.target === $('combatBackdrop')) showToast('El combate no permite apartar la mirada.'); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (!$('shopBackdrop').classList.contains('hidden')) closeShop();
      else if ($('notesDrawer').classList.contains('open')) $('drawerClose').click();
    }
    if (!$('combatBackdrop').classList.contains('hidden')) {
      if (event.key === '1') playerAction('attack');
      if (event.key === '2') playerAction('guard');
      if (event.key === '3') playerAction('potion');
      if (event.key === '4') playerAction('flee');
    }
  });
  renderClassOptions();
  renderEvent();
})();
