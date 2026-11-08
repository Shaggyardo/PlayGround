(() => {
  const maxHealth = 10, maxSanity = 10;
  const initial = () => ({ gold: 12, health: 8, sanity: 7, step: 0, flags: {}, notes: [], history: [] });
  let state = initial(), locked = false, toastTimer;
  const $ = id => document.getElementById(id);
  const roman = ['I','II','III','IV','V','VI','VII','VIII'];
  const stories = [
    {
      chapter:'PROLOGUE · THE LAST MILE', place:'THE ASHEN ROAD', type:"A STRANGER'S PRAYER", title:'The last mile',
      copy:'Rain needles the road. At the milestone, a dying courier clutches a sealed letter to his chest. A black wax sigil marks it as the Queen’s own. Somewhere behind you, a bell tolls once.',
      memory:'The road has not yet learned your name.', scene:'road',
      choices:[
        {action:'Take the letter',detail:'A dead man’s last wish may buy you passage.',cost:[['+3','gold'],['−1','sanity']],effect:{gold:3,sanity:-1},flag:{letter:true},note:'You took the Queen’s sealed letter. Its wax was warm.'},
        {action:'Leave him to the crows',detail:'Keep your hands clean. Keep moving.',cost:[['+1','health'],['−2','gold']],effect:{health:1,gold:-2},flag:{mercy:true},note:'You left a dying courier on the road. He watched you go.'}
      ]
    },
    {
      chapter:'ACT I · THE HOLLOW MILE',place:'THE WEEPING BRIDGE',type:'A TOLL IN BLOOD',title:'The bridge keeper',scene:'bridge',
      copy:s=>s.flags.letter?'A toll-keeper in a crown of fingers blocks the bridge. His milky eyes fix on the Queen’s seal beneath your coat. “That belongs to the dead,” he says. “Or to me.”':'A toll-keeper in a crown of fingers blocks the bridge. Beneath the planks, the river whispers your childhood name. “Coin, blood, or a secret,” he croaks.',
      memory:s=>s.flags.letter?'The black wax draws hungry eyes.':'The river knows a name you never gave it.',
      choices:s=>[
        {action:s.flags.letter?'Show him the seal':'Pay his toll',detail:s.flags.letter?'Let the royal mark do the threatening.':'Some doors open only for the right weight of coin.',cost:s.flags.letter?[['+1','sanity']]:[['−4','gold']],effect:s.flags.letter?{sanity:1}:{gold:-4},flag:{bridgePaid:true},note:s.flags.letter?'The keeper bowed to the seal, though his smile did not.':'You paid the keeper. The bridge let you pass.'},
        {action:'Make him afraid',detail:'A little violence is cheaper than a little trust.',cost:[['−2','health'],['+2','gold']],effect:{health:-2,gold:2},flag:{bridgeThreat:true},note:'You crossed the bridge over its keeper’s groans.'},
        {action:'Whisper to the river',detail:'Give the water a memory. It will give you a way across.',cost:[['−2','sanity']],effect:{sanity:-2},requires:{stat:'sanity',min:6,label:'6 SANITY'},flag:{riverGift:true},note:'The river carried you across, then kept a piece of your past.'}
      ]
    },
    {
      chapter:'ACT I · THE HOLLOW MILE',place:'SAINT ORRA’S CRYPT',type:'A CANDLE IN THE DARK',title:'The saint’s teeth',scene:'crypt',
      copy:s=>s.flags.letter?'The letter gives a faint, rhythmic pulse. A crypt door opens at its approach. Inside, a reliquary glitters beneath a fresco of the Queen weeping black tears.':'A crypt door yawns open beneath a fresco of the Queen weeping black tears. Something gold glitters between the saint’s teeth.',
      memory:s=>s.flags.riverGift?'The cold river speaks in the silence between your thoughts.':'The dead here were buried facing the wrong way.',
      choices:[
        {action:'Loot the reliquary',detail:'Gold spends well, even when it screams.',cost:[['+6','gold'],['−2','sanity']],effect:{gold:6,sanity:-2},flag:{relic:true},note:'You pried the saint’s gold teeth free. They chattered all the way down.'},
        {action:'Salt the threshold',detail:'Deny the dead their audience. Take the quiet and go.',cost:[['+1','sanity']],effect:{sanity:1},flag:{cryptSealed:true},note:'You sealed the crypt. Something inside thanked you in your mother’s voice.'},
        {action:'Drink the black incense',detail:'Let the dead lend you their sight.',cost:[['−3','health'],['+2','sanity']],effect:{health:-3,sanity:2},requires:{stat:'sanity',min:5,label:'5 SANITY'},flag:{deathSight:true},note:'The dead showed you a path. You can no longer remember your own face.'}
      ]
    },
    {
      chapter:'ACT II · THE RED CONFESSION',place:'VILLAGE OF CROWS',type:'A DEBT COMES DUE',title:'The inquisitor’s offer',scene:'village',
      copy:s=>s.flags.mercy?'At the village gate, the courier’s sister waits with a crossbow. She saw you leave him. Before she can loose, an inquisitor offers to buy your silence.':'At the village gate, an inquisitor in a velvet mask offers coin for a name. Behind him, villagers hang from the chapel eaves, swinging in the wet wind.',
      memory:s=>s.flags.letter?'“Give me the letter,” the inquisitor says. “Or give me its bearer.”':'The inquisitor’s offer smells of cloves and old blood.',
      choices:s=>[
        {action:s.flags.mercy?'Trade the sister’s name':'Sell a name',detail:'One life for a purse. You need not say whose.',cost:[['+5','gold'],['−1','sanity']],effect:{gold:5,sanity:-1},flag:{inquisitorDeal:true},note:'You sold a name to the inquisitor. He did not ask how you knew it.'},
        {action:'Take his purse, take his eye',detail:'A brutal bargain. No witnesses you need to keep.',cost:[['−2','health'],['+4','gold']],effect:{health:-2,gold:4},flag:{inquisitorRobbed:true},note:'You left the inquisitor bleeding in the mud. The crows followed.'},
        {action:'Buy the villagers’ freedom',detail:'A costly gesture; they may remember it.',cost:[['−6','gold'],['+1','sanity']],effect:{gold:-6,sanity:1},requires:{stat:'gold',min:8,label:'8 GOLD'},flag:{villagersSaved:true},note:'You bought the villagers’ freedom. They pressed a rusted key into your hand.'}
      ]
    },
    {
      chapter:'ACT II · THE RED CONFESSION',place:'THE BLACKWOOD',type:'A CHOICE IN THE TREES',title:'The old companion',scene:'woods',
      copy:s=>s.flags.villagersSaved?'A freed villager leads you into the blackwood. Your old companion, Mara, waits beneath a hanging tree. “The Queen is a hollow thing,” she says. “Help me end her.”':'Mara steps from the blackwood, your old companion and once your shield. Her blade is drawn. “The Queen is a hollow thing,” she says. “Help me end her.”',
      memory:s=>s.flags.inquisitorDeal?'Mara knows what you sold. She does not ask for whom.':'Once, you shared a blanket and a battlefield. Only one remains warm.',
      choices:s=>[
        {action:'Stand with Mara',detail:'Trust is a blade. Hope it points outward.',cost:[['−1','gold'],['+1','sanity']],effect:{gold:-1,sanity:1},flag:{maraAlly:true},note:'You chose Mara. She gave you the old sign: two fingers to the heart.'},
        {action:'Sell her to the crown',detail:'An old friend is worth more alive to an inquisitor.',cost:[['+6','gold'],['−2','sanity']],effect:{gold:6,sanity:-2},flag:{maraSold:true},note:'You sold Mara. She met your eyes as the irons closed.'},
        {action:'Strike before she can',detail:'No promises. No loose ends.',cost:[['−2','health'],['+3','gold']],effect:{health:-2,gold:3},requires:{stat:'health',min:6,label:'6 HEALTH'},flag:{maraKilled:true},note:'You struck first. Mara fell without a word.'}
      ]
    },
    {
      chapter:'ACT III · THE SUNKEN CROWN',place:'THE DROWNED KEEP',type:'A DOOR THAT BREATHES',title:'Under the drowned keep',scene:'keep',
      copy:s=>s.flags.maraAlly?'Mara finds a submerged gate beneath the keep. Through it, a stair coils down toward a heartbeat that shakes the stones.':'The drowned keep rises from the black water. A stair descends beneath it, toward a heartbeat that shakes the stones.',
      memory:s=>s.flags.relic?'The saint’s teeth chime against your purse. The stair answers.':'Water climbs the walls, though the tide has gone out.',
      choices:s=>[
        {action:'Force the iron gate',detail:'Muscle through before the water takes your breath.',cost:[['−3','health']],effect:{health:-3},flag:{gateForced:true},note:'You forced the gate. The keep took its due in blood.'},
        {action:'Offer the Queen’s letter',detail:'A royal seal may open what iron cannot.',cost:[['−1','sanity']],effect:{sanity:-1},requires:{flag:'letter',label:'THE QUEEN’S LETTER'},flag:{letterBurned:true},note:'The letter burned blue. Something below whispered, “At last.”'},
        {action:'Find another way in',detail:'Let the dark show you its old seams.',cost:[['−2','sanity'],['+2','gold']],effect:{sanity:-2,gold:2},flag:{darkRoute:true},note:'You found a forgotten way down, and something else found you.'}
      ]
    },
    {
      chapter:'ACT III · THE SUNKEN CROWN',place:'THE THRONE BELOW',type:'THE LAST BARGAIN',title:'What the crown wants',scene:'throne',
      copy:s=>s.flags.letterBurned?'The Queen sits beneath the waves, a crown of drowned stars above her brow. The letter’s smoke circles her throat like a noose. “Choose what you came to be.”':'The Queen sits beneath the waves, a crown of drowned stars above her brow. She knows every road you took to reach her. “Choose what you came to be.”',
      memory:s=>s.flags.maraAlly?'Mara takes your left hand. “Whatever happens, do not let her keep your name.”':s.flags.relic?'The saint’s teeth rattle in your purse, eager to be let out.':'Beyond the throne, the sea presses its face against the glass.',
      choices:s=>[
        {action:'Take the crown',detail:'Rule the cursed kingdom. Make its hunger yours.',cost:[['−2','sanity']],effect:{sanity:-2},flag:{ending:'crown'},note:'You took the crown. The sea bowed—and so did every shadow.'},
        {action:s.flags.maraAlly?'Give Mara your name':'Break the drowned stars',detail:s.flags.maraAlly?'A life for a life; trust her with the final cut.':'Shatter the crown and let the old dark drown with it.',cost:[['−2','health'],['−1','sanity']],effect:{health:-2,sanity:-1},flag:{ending:'break'},note:s.flags.maraAlly?'You gave Mara your name. She made the cut.':'You broke the crown. For the first time in a century, the tide turned.'},
        {action:'Name a new price',detail:'Make the Queen bargain with the one thing she cannot own.',cost:[['−5','gold']],effect:{gold:-5},requires:{stat:'gold',min:10,label:'10 GOLD'},flag:{ending:'bargain'},note:'You bought a kingdom’s dawn with every coin you had.'}
      ]
    }
  ];
  const statNames={gold:'GOLD',health:'HEALTH',sanity:'SANITY'};
  function resolved(value){return typeof value==='function'?value(state):value}
  function render(){
    const c=stories[state.step]; if(!c){finish();return}
    $('chapterLabel').textContent=c.chapter;$('artLocation').textContent=c.place;$('eventType').textContent=c.type;$('eventTitle').textContent=c.title;$('eventCopy').textContent=resolved(c.copy);$('memoryText').textContent=resolved(c.memory||'The dark is listening.');$('eventNumber').textContent=roman[state.step];
    const choices=resolved(c.choices);
    const visible=[choices[0],choices[1]];
    // An earned third option replaces the second choice; before it is earned, both ordinary options remain available.
    if(choices[2]&&canChoose(choices[2]))visible[1]=choices[2];
    visible.forEach((choice,i)=>paintChoice(i,choice));
    updateStats();updateJourney();updateNotes();setScene(c.scene);
  }
  function paintChoice(index,ch){
    const el=index===0?$('choiceLeft'):$('choiceRight');el.dataset.locked='false';el.classList.remove('choice-locked');el.disabled=false;
    $(index===0?'leftAction':'rightAction').textContent=ch.action;$(index===0?'leftDetail':'rightDetail').textContent=ch.detail;
    const cost=ch.cost||[];$(index===0?'leftCost':'rightCost').innerHTML=cost.map(([n,s])=>`<b class="${n.startsWith('−')?'loss':''}">${n}</b> ${statNames[s]}`).join(' <i>·</i> ')||'<b>NO PRICE</b>';
    el.onclick=()=>choose(ch,index);
  }
  function canChoose(ch){if(!ch.requires)return true;const r=ch.requires;if(r.stat)return state[r.stat]>=r.min;if(r.flag)return !!state.flags[r.flag];return true}
  function choose(ch,index){if(locked||!canChoose(ch))return;locked=true;const c=$('eventCard');c.classList.add('advance');if(index===1)c.classList.add('right');
    setTimeout(()=>{
      Object.entries(ch.effect||{}).forEach(([key,value])=>state[key]=Math.max(0,Math.min(key==='gold'?99:key==='health'?maxHealth:maxSanity,state[key]+value)));
      if(ch.flag)Object.assign(state.flags,ch.flag);if(ch.note)state.notes.push({title:stories[state.step].title,text:ch.note});state.history.push({step:state.step,action:ch.action});
      if(state.health<=0||state.sanity<=0||state.gold<=0){finish(state.health<=0?'health':state.sanity<=0?'sanity':'gold');return}
      if(state.step===stories.length-1){finish();return}
      state.step++;c.classList.remove('advance','right');locked=false;render();
    },260)
  }
  function updateStats(){[['gold','goldValue'],['health','healthValue'],['sanity','sanityValue']].forEach(([stat,id])=>$(id).textContent=state[stat]);$('healthMeter').style.width=`${state.health/maxHealth*100}%`;$('sanityMeter').style.width=`${state.sanity/maxSanity*100}%`}
  function updateJourney(){$('journeyCount').innerHTML=`${String(state.step+1).padStart(2,'0')} <span>/ 08</span>`;const track=$('journeyTrack');track.innerHTML=stories.map((_,i)=>`<i class="journey-dot ${i<=state.step?'done':''}"></i>`).join('');track.style.setProperty('--progress',`${state.step/(stories.length-1)*100}%`)}
  function updateNotes(){$('noteCount').textContent=state.notes.length;const list=$('notesList');list.innerHTML=state.notes.length?state.notes.map(n=>`<article class="note-entry"><span>${escapeHtml(n.title.toUpperCase())}</span><p>${escapeHtml(n.text)}</p></article>`).join(''):'<p class="empty-notes">No marks yet. The road is still deciding what to keep.</p>'}
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  const scenes={
    road:['#201b20','#66443e','468,93','M0 206 90 151l80 64 70-94 86 91 89-79 99 75 58-43 68 47v148H0Z'],
    bridge:['#192326','#51605a','467,79','M0 228 74 190l90 50 90-82 89 90 80-63 96 62 56-46 65 34v125H0Z'],
    crypt:['#1b171b','#573c3c','470,74','M0 232 80 166l71 66 66-116 75 111 91-82 78 90 74-70 105 59v136H0Z'],
    village:['#211a1b','#744b43','480,85','M0 220 70 199v-56l60 0v41l40-20 62 33 65-71 81 87 70-30 70 34 74-56 48 35v164H0Z'],
    woods:['#141b19','#4e5948','470,75','M0 230 51 115l38 115 56-149 43 159 56-203 50 201 62-160 45 172 64-211 54 189 52-140 69 151v111H0Z'],
    keep:['#171a20','#48565e','468,76','M0 219 84 167l73 50 68-126 72 112 80-61 70 77 69-47 76 41 48-38v125H0Z'],
    throne:['#19181f','#72544d','472,80','M0 236 77 204l76 20 69-121 70 112 78-64 71 67 83-47 76 54 63-28 77 37v126H0Z']
  };
  function setScene(scene){const [sky,haze,moon,path]=scenes[scene]||scenes.road;const svg=$('sceneSvg');svg.innerHTML=`<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky}"/><stop offset=".62" stop-color="${haze}"/><stop offset="1" stop-color="#171516"/></linearGradient><radialGradient id="moon"><stop stop-color="#eee0bd"/><stop offset=".65" stop-color="#d8c6a5"/><stop offset="1" stop-color="#c09b75" stop-opacity=".12"/></radialGradient></defs><rect width="640" height="360" fill="url(#sky)"/><circle cx="${moon.split(',')[0]}" cy="${moon.split(',')[1]}" r="58" fill="url(#moon)" opacity=".8"/><path d="${path}" fill="#292226"/><path d="M0 263q90-51 176-9t158-1q118-44 306 11v96H0Z" fill="#171618"/><path d="m300 360 52-113 38-42 14 42 21 21 30 92Z" fill="#39302e"/><path d="m352 247 39-41 15 42" fill="none" stroke="#85634f" stroke-width="3" opacity=".55"/><path d="M116 255v-82m0 14-29-24m29 36 27-43m-28 68-22-17m414 50v-87m0 31-20-18m20 37 25-35" fill="none" stroke="#141315" stroke-width="12" stroke-linecap="round"/><path d="M43 280q130-38 231-3m205-6q64-24 131-2" stroke="#7c5343" stroke-width="1" opacity=".4" fill="none"/>`}
  function finish(cause){locked=true;const modal=$('modalBackdrop');modal.classList.remove('hidden');const title=$('modalTitle'),copy=$('modalCopy'),emblem=$('modalEmblem'),eyebrow=$('modalEyebrow');
    if(cause){emblem.textContent=cause==='health'?'†':'◉';eyebrow.textContent=cause==='sanity'?'THE DARK HAS YOUR NAME':'THE KINGDOM HAS TAKEN ITS DUE';title.textContent=cause==='health'?'A body for the crows':cause==='sanity'?'The last thought':'The road ends here';copy.textContent=cause==='health'?'Steel found its mark. The road goes on without you, as roads do.':cause==='sanity'?'The whispers became a choir. You joined them, and forgot which voice was yours.':'You have nothing left to bargain with. The kingdom keeps what it is owed.'}
    else{emblem.textContent=state.flags.ending==='crown'?'♛':state.flags.ending==='bargain'?'◈':'✦';eyebrow.textContent='THE KINGDOM WILL REMEMBER';title.textContent=state.flags.ending==='crown'?'A crown of drowned stars':state.flags.ending==='bargain'?'The price of morning':state.flags.maraAlly?'Two names, one dawn':'The tide turns';copy.textContent=state.flags.ending==='crown'?'You wear the drowned crown. The kingdom kneels, and the shadows learn to call you sovereign. Was it worth the name you surrendered?':state.flags.ending==='bargain'?'With your last coins, you bought the kingdom a sunrise. You leave with empty hands—and the first honest silence in years.':state.flags.ending==='break'&&state.flags.maraAlly?'Mara breaks the crown with your name on her lips. The waters recede. At dawn, she cannot remember your face.':'The drowned stars shatter. The old curse breaks with them. Somewhere on the road, the crows cry out like bells.'}
    $('endingSummary').innerHTML=`<span><b>${state.gold}</b>GOLD</span><span><b>${state.health}</b>HEALTH</span><span><b>${state.sanity}</b>SANITY</span><span><b>${state.step+1}/8</b>FATE`;
  }
  function restart(){state=initial();locked=false;$('modalBackdrop').classList.add('hidden');$('eventCard').classList.remove('advance','right');render()}
  function showToast(text){const t=$('toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}
  $('restartButton').onclick=restart;$('brandHome').onclick=e=>{e.preventDefault();if(state.step||state.notes.length){if(confirm('Abandon this road and begin again?'))restart()}};
  $('codexButton').onclick=()=>{$('notesDrawer').classList.add('open');$('notesDrawer').setAttribute('aria-hidden','false')};$('drawerClose').onclick=()=>{$('notesDrawer').classList.remove('open');$('notesDrawer').setAttribute('aria-hidden','true')};
  $('soundToggle').onclick=()=>{const btn=$('soundToggle');const on=btn.dataset.on!=='true';btn.dataset.on=String(on);btn.querySelector('span').textContent=on?'Sound on':'Sound off';showToast(on?'The road hums beneath your feet.':'The silence returns.')};
  let touchStart=null;const area=$('eventCard');area.addEventListener('touchstart',e=>{touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}}, {passive:true});area.addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.25){const button=dx<0?$('choiceLeft'):$('choiceRight');if(!button.disabled)button.click()}},{passive:true});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&!$('choiceLeft').disabled)$('choiceLeft').click();if(e.key==='ArrowRight'&&!$('choiceRight').disabled)$('choiceRight').click();if(e.key==='Escape'){$('notesDrawer').classList.remove('open');$('notesDrawer').setAttribute('aria-hidden','true')}});
  render();
})();
