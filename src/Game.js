import { CONFIG } from "./config.js";
import { RUNTIME_POINTS as POINTS } from "./data/worldRuntime.js";
import { MissionSystem } from "./systems/missions.js";
import { VehicleSystem, routeTo, farmMachineRoute } from "./systems/vehicles.js";
import { TimeSystems } from "./systems/timeSystems.js";
import { EconomySystem } from "./systems/economy.js";
import { InventorySystem } from "./systems/inventory.js";
import { FieldSystem } from "./systems/fields.js";
import { CropSystem } from "./systems/crops.js";
import { PlantingSystem } from "./systems/planting.js";
import { HarvestSystem } from "./systems/harvest.js";
import { SellingSystem } from "./systems/selling.js";
import { FertilizerSystem } from "./systems/fertilizer.js";

export class Game {
  constructor({ state, save, events, camera, renderer, ui }) {
    this.state = state;
    this.save = save;
    this.events = events;
    this.camera = camera;
    this.renderer = renderer;
    this.ui = ui;

    this.missions = new MissionSystem(state);
    this.vehicles = new VehicleSystem({state,events});
    this.timeSystems = new TimeSystems(state,events);
    this.economy = new EconomySystem(state);
    this.inventory = new InventorySystem(state);
    this.fields = new FieldSystem(state);
    this.crops = new CropSystem();
    this.planting = new PlantingSystem({ state, economy: this.economy, inventory: this.inventory, fields: this.fields, crops: this.crops });
    this.harvest = new HarvestSystem({ state, inventory: this.inventory, fields: this.fields, crops: this.crops });
    this.selling = new SellingSystem({ economy: this.economy, inventory: this.inventory });
    this.fertilizer = new FertilizerSystem({ state, economy: this.economy, inventory: this.inventory, fields: this.fields, crops: this.crops });

    this.lastAutosave = performance.now();
    this.lastFrame = performance.now();
    this.running = false;
    this.raf = 0;

    this.installEventHandlers();
    this.reconcileState();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrame = performance.now();
    const loop = (nowPerf) => {
      if (!this.running) return;
      const dt = Math.min(.1,(nowPerf-this.lastFrame)/1000);
      this.lastFrame = nowPerf;
      this.update(dt);
      this.renderer.render(this.state,Date.now());
      this.ui.updateHUD(this.state);
      this.raf = requestAnimationFrame(loop);
    };
    this.raf=requestAnimationFrame(loop);
  }

  stop() { this.running=false; if(this.raf) cancelAnimationFrame(this.raf); }

  update(dt) {
    const now=Date.now();
    this.camera.update(dt);
    this.vehicles.update(dt*(this.state.world.timeScale||1),now);
    this.timeSystems.update(dt,now);

    if(performance.now()-this.lastAutosave>=CONFIG.autosaveMs){
      this.save.save(this.state);
      this.lastAutosave=performance.now();
    }
  }

  reconcileState() {
    this.timeSystems.reconcileOffline(Date.now());
    // If a saved vehicle references a missing route, remove it safely.
    this.state.vehicles=this.state.vehicles.filter(v=>Array.isArray(v.route)&&v.route.length>0);
  }

  installEventHandlers() {
    this.events.on("vehicle:arriveWaypoint", ({vehicle,tag}) => this.onVehicleArrive(vehicle,tag));
    this.events.on("vehicle:leaveWaypoint", ({vehicle,tag}) => this.onVehicleLeave(vehicle,tag));
    this.events.on("vehicle:complete", (vehicle) => this.onVehicleComplete(vehicle));
    this.events.on("construction:complete", c => this.onConstructionComplete(c));
    this.events.on("field:ready", () => this.ui.toast("🌾 Dein Weizen ist erntereif."));
    this.events.on("mill:ready", () => this.ui.toast("📦 Das Mehl ist fertig."));
    this.events.on("chickens:ready", () => this.ui.toast("🥚 Die Hühner haben Eier produziert."));
    this.events.on("cows:ready", () => this.ui.toast("🥛 Die Milch ist bereit."));
  }

  handleTap(screenPoint) {
    const p=this.camera.screenToWorld(screenPoint.x,screenPoint.y);
    const o=this.renderer.objectAt(p.x,p.y);
    if(!o) return;
    this.openObject(o.id);
  }

  openObject(id) {
    switch(id){
      case "farmhouse": return this.openFarmhouse();
      case "field1": return this.openField();
      case "silo": return this.openSilo();
      case "barn": return this.openBarn();
      case "garage": return this.openGarage();
      case "mill": return this.openMill();
      case "coop": return this.openChickens();
      case "cowpen": return this.openCows();
      case "bakery": return this.openBakery();
      case "loading": return this.openLoading();
      default: return this.openLandmark(id);
    }
  }

  openFarmhouse() {
    const m=this.missions.current();
    const actions=[];

    if(this.state.missionId==="scrap_sale" && this.state.missionStep===0) {
      actions.push({label:"Schrott verkaufen · +100 F",onClick:()=>this.startScrapSale()});
    } else if(this.state.missionId==="friend_gift" && this.state.missionStep===0) {
      actions.push({label:"Geschenk annehmen",onClick:()=>this.startFriendGift()});
    } else if(this.state.missionId==="first_seed") {
      if(this.state.missionStep===0) actions.push({label:"Hofkatalog öffnen",onClick:()=>this.openCatalog()});
      else if(this.state.missionStep===1) actions.push({label:"Zum Feld",onClick:()=>{this.ui.closeSheet();this.camera.focus(POINTS.field.x,POINTS.field.y);}});
    } else if(this.state.missionId==="first_harvest") {
      actions.push({label:"Zum Feld",onClick:()=>{this.ui.closeSheet();this.camera.focus(POINTS.field.x,POINTS.field.y);}});
    } else if(this.state.missionId==="first_order") {
      actions.push({label:"Zum Verkaufstruck",onClick:()=>{this.ui.closeSheet();this.camera.focus(POINTS.loading.x,POINTS.loading.y);}});
    } else if(this.state.missionId==="storage_upgrade") {
      actions.push({label:"Zum Silo",onClick:()=>{this.ui.closeSheet();this.camera.focus(POINTS.silo.x,POINTS.silo.y);}});
    } else if(this.state.missionId==="miller_intro") {
      if(this.state.missionStep===0) actions.push({label:"Müller empfangen",onClick:()=>this.startMillerIntro()});
      else actions.push({label:"Zur Mühle",onClick:()=>{this.ui.closeSheet();this.camera.focus(POINTS.mill.x,POINTS.mill.y);}});
    } else if(this.state.missionId==="workshop_chickens") {
      actions.push({label:"Zur Werkstatt",onClick:()=>{this.ui.closeSheet();this.camera.focus(POINTS.garage.x,POINTS.garage.y);}});
    } else if(this.state.missionId==="eggs_baker") {
      const canBaker=this.inventory.hasAll("barn",{eggs:2,flour:1});
      actions.push({label:canBaker?"Zum Bäcker":"Zum Hühnergehege",onClick:()=>{this.ui.closeSheet();this.camera.focus(canBaker?POINTS.bakery.x:POINTS.coop.x,canBaker?POINTS.bakery.y:POINTS.coop.y);}});
    } else if(this.state.missionId==="cows_milk") {
      const canBaker=this.inventory.hasAll("barn",{milk:1,flour:1});
      if(!this.state.cows.unlocked) actions.push({label:"2 Kühe übernehmen",onClick:()=>this.startCowDelivery()});
      else actions.push({label:canBaker?"Zum Bäcker":"Zur Kuhweide",onClick:()=>{this.ui.closeSheet();this.camera.focus(canBaker?POINTS.bakery.x:POINTS.cowpen.x,canBaker?POINTS.bakery.y:POINTS.cowpen.y);}});
    }

    if (!(this.state.missionId==="first_seed" && this.state.missionStep===0)) actions.push({label:"Hofkatalog",secondary:true,onClick:()=>this.openCatalog()});

    const doneAchievements = Object.values(this.state.achievements || {}).filter(Boolean).length;
    const body=`
      <p>${m.desc}</p>
      <div class="status"><strong>Ziel:</strong><br>${m.goal}</div>
      <div class="status">${this.progressText()}</div>
      <div class="status"><strong>Hof-Hub</strong><br>Errungenschaften: ${doneAchievements}/3 · Aktive Fahrzeuge: ${this.state.vehicles.length}</div>
    `;
    this.ui.panel({eyebrow:`Level ${this.state.level}`,title:m.title,body,actions});
  }

  progressText() {
    const s=this.state;
    switch(s.missionId){
      case "scrap_sale": return `Schrott: ${this.inventory.has("inventory","scrap",1) ? "bereit" : "abgeholt"}`;
      case "friend_gift": return s.machines.tractor ? "Traktor und Sämaschine angekommen ✓" : "Lieferung steht aus";
      case "first_seed":
        return `Saatgut: ${this.inventory.getQuantity("inventory","wheatSeed")} · Feld: ${statusName(s.field.status)}`;
      case "first_harvest":
        return `Feld: ${statusName(s.field.status)} · Silo: ${this.inventory.getQuantity("silo","wheat")}/${this.inventory.getCapacity("silo")} Weizen`;
      case "first_order": return `Weizen: ${this.inventory.getQuantity("silo","wheat")}/5`;
      case "storage_upgrade": return `Silo Level ${s.silo.level} · Kapazität ${s.silo.capacity}`;
      case "miller_intro": return `Weizen: ${this.inventory.getQuantity("silo","wheat")} · Mehl: ${this.inventory.getQuantity("barn","flour")}`;
      case "workshop_chickens": return `Werkstatt Level ${s.garage.level} · Hühner: ${s.chickens.count}`;
      case "eggs_baker": return `Eier: ${this.inventory.getQuantity("barn","eggs")} · Mehl: ${this.inventory.getQuantity("barn","flour")}`;
      case "cows_milk": return `Kühe: ${s.cows.count} · Milch: ${this.inventory.getQuantity("barn","milk")} · Mehl: ${this.inventory.getQuantity("barn","flour")}`;
      default:return "Einführung abgeschlossen. Das Tal kann weiter ausgebaut werden.";
    }
  }

  openCatalog() {
    const crop=this.crops.get("wheat");
    const price=this.planting.getSeedPrice("wheat");
    const deliveryPending=this.vehicles.hasEvent("seed_delivery");
    const can=this.planting.canBuySeed("wheat") && !deliveryPending;
    const fertilizerUnlocked=this.fertilizer.isUnlocked("wheat");
    const fertilizerOffer=this.fertilizer.getOffer("wheat");
    const fertilizerCanBuy=this.fertilizer.canBuyPack("wheat");
    const actions=[
      {label:deliveryPending?"Lieferung unterwegs":can?`Weizensaat · ${price} F`:"Nicht genug Geld für Saat",disabled:!can,onClick:()=>this.buyWheatSeed()}
    ];
    if(fertilizerUnlocked){
      actions.push({
        label:fertilizerCanBuy?`${fertilizerOffer.packSize} Säcke Dünger · ${fertilizerOffer.price} F`:`${fertilizerOffer.price} F für ${fertilizerOffer.packSize} Säcke Dünger benötigt`,
        disabled:!fertilizerCanBuy,
        onClick:()=>this.buyFertilizerPack()
      });
    }
    const fertilizerBody=fertilizerUnlocked
      ?`<div class="status">🌱 Dünger: <strong>${fertilizerOffer.available}</strong> Sack<br>${fertilizerOffer.packSize} Säcke kosten ${fertilizerOffer.price} F · 1 Sack pro Feld</div>`
      :`<div class="status">🌱 Dünger wird ab Level ${fertilizerOffer.unlockLevel} freigeschaltet.</div>`;
    this.ui.panel({
      eyebrow:"Hofkatalog",title:"Saatgut & Dünger",
      body:`<div class="status">🌾 ${crop.name}saatgut: <strong>${this.inventory.getQuantity("inventory",crop.seedItem)}</strong> Sack<br>Preis: ${price} F · 1 Sack pro Feld<br>Lieferung: sofort per Postauto</div>${fertilizerBody}`,
      actions
    });
  }

  buyFertilizerPack() {
    const result=this.fertilizer.buyPack("wheat");
    if(!result)return;
    this.ui.closeSheet();
    this.ui.toast(`🌱 +${result.amount} Säcke Dünger · -${result.cost} F`);
    this.save.save(this.state);
  }

  buyWheatSeed() {
    if(this.vehicles.hasEvent("seed_delivery") || !this.planting.buySeed("wheat"))return;
    if(this.state.missionId==="first_seed") this.state.missionStep=0.5;
    this.vehicles.spawn({
      id:uid("post"),type:"post_van",eventId:"seed_delivery",
      route:routeTo(POINTS.loading,{tag:"seed_delivery",waitMs:3500})
    });
    this.ui.closeSheet();this.ui.toast("📮 Das Postauto ist unterwegs.");
    this.save.save(this.state);
  }

  startScrapSale() {
    if(this.vehicles.hasEvent("scrap_sale"))return;
    this.state.missionStep=0.5;
    this.vehicles.spawn({id:uid("scrap"),type:"scrap_truck",eventId:"scrap_sale",route:routeTo(POINTS.loading,{tag:"scrap_pickup",waitMs:5000})});
    this.ui.closeSheet();this.ui.toast("🚚 Der Schrotthändler fährt ins Tal.");
    this.save.save(this.state);
  }

  startFriendGift() {
    if(this.vehicles.hasEvent("friend_gift"))return;
    this.state.missionStep=.5;
    this.vehicles.spawn({id:uid("gift"),type:"flatbed",eventId:"friend_gift",route:routeTo(POINTS.loading,{tag:"gift_unload",waitMs:5000})});
    this.ui.closeSheet();this.ui.toast("🚜 Der Tieflader kommt zum Hof.");
  }

  openField() {
    const f=this.state.field;
    if(this.planting.canStartSowing("wheat")){
      return this.ui.panel({
        eyebrow:"Feld 1",title:"Weizen aussäen",
        body:`<p>Der Traktor holt die Sämaschine aus der Werkstatt und fährt selbstständig zum Feld.</p>`,
        actions:[{label:"Aussaat starten",onClick:()=>this.startSowing()}]
      });
    }
    if(f.status==="growing"){
      const now=Date.now();
      const sec=Math.max(0,Math.ceil((f.readyAt-now)/1000));
      const fertilizer=this.fertilizer.getFieldStatus(now);
      const actions=[];
      if(fertilizer.unlocked && !fertilizer.fertilized){
        if(fertilizer.canApply){
          actions.push({label:"1 Sack Dünger verwenden",onClick:()=>this.applyFertilizer()});
        }else if(fertilizer.reason==="no_fertilizer"){
          actions.push({label:"Dünger im Hofkatalog kaufen",secondary:true,onClick:()=>this.openCatalog()});
        }else if(fertilizer.reason==="too_late"){
          actions.push({label:"Zu spät zum Düngen",disabled:true,onClick:()=>{}});
        }
      }
      const fertilizerText=fertilizer.fertilized
        ?"Gedüngt ✓"
        :fertilizer.unlocked
          ?`${fertilizer.available} Sack verfügbar`
          :`ab Level ${this.fertilizer.getOffer("wheat").unlockLevel}`;
      return this.ui.panel({
        eyebrow:"Feld 1",
        title:"Weizen wächst",
        body:`<div class="status">Restzeit: <strong>${formatTime(sec)}</strong><br>🌱 Dünger: ${fertilizerText}</div>`,
        actions
      });
    }
    if(f.status==="ready"){
      const plan=this.harvest.getPlan();
      const active=this.vehicles.hasEvent("harvest_wheat");
      const can=this.harvest.canStartHarvest()&&!active;
      const label=active
        ?"Mähdrescher unterwegs"
        :!plan?.machineAvailable
          ?"Mähdrescher nicht verfügbar"
          :!plan?.storageFits
            ?`Silo: ${plan?.yieldAmount||0} freie Plätze benötigt`
            :"Ernte starten";
      return this.ui.panel({
        eyebrow:"Feld 1",
        title:"Weizen ist reif",
        body:`<p>Der Mähdrescher erntet nur, wenn die komplette Ernte ins Silo passt.</p><div class="status">Ertrag: <strong>${plan?.yieldAmount||0} Weizen</strong><br>Freier Siloplatz: ${plan?.freeSpace??0}</div>`,
        actions:[{label,disabled:!can,onClick:()=>this.startHarvest()}]
      });
    }
    if(f.status==="harvested"){
      const plan=this.harvest.getPlan();
      const active=this.vehicles.hasEvent("harvest_wheat");
      const can=this.harvest.canStoreHarvest()&&!active;
      return this.ui.panel({
        eyebrow:"Feld 1",
        title:"Ernte wartet auf Lagerplatz",
        body:`<p>${active?"Der Mähdrescher bringt die Ernte zum Silo.":"Die geschnittene Ernte bleibt erhalten, bis genug Platz im Silo frei ist."}</p><div class="status">Ernte: <strong>${plan?.yieldAmount||0} Weizen</strong><br>Freier Siloplatz: ${plan?.freeSpace??0}</div>`,
        actions:active?[]:[{label:can?"Ernte einlagern":"Silo voll",disabled:!can,onClick:()=>this.completeHarvestStorage(true)}]
      });
    }
    this.ui.panel({eyebrow:"Feld 1",title:"Acker",body:`<div class="status">Status: ${statusName(f.status)}</div>`,actions:[]});
  }

  startSowing() {
    if(!this.planting.startSowing("wheat"))return;
    const p=POINTS;
    const route=farmMachineRoute([
      {x:p.garage.x,y:p.garage.y},
      {...p.fieldApproach},
      {x:p.field.x,y:p.field.y,tag:"sow",waitMs:CONFIG.timings.sowWaitMs},
      {...p.fieldApproach},
      {x:p.garage.x,y:p.garage.y},
    ]);
    this.vehicles.spawn({id:uid("tractor"),type:"tractor",eventId:"sow_wheat",route});
    this.ui.closeSheet();this.ui.toast("🚜 Traktor und Sämaschine fahren zum Feld.");
  }

  applyFertilizer() {
    const result=this.fertilizer.apply(Date.now());
    if(!result){
      this.ui.toast("🌱 Dünger kann jetzt nicht verwendet werden.");
      return;
    }
    this.ui.closeSheet();
    this.ui.toast(`🌱 Feld gedüngt · neue Restzeit ${formatTime(Math.ceil(result.remainingMs/1000))}`);
    this.save.save(this.state);
  }

  startHarvest() {
    if(this.vehicles.hasEvent("harvest_wheat")||!this.harvest.startHarvest())return;
    const p=POINTS;
    const route=farmMachineRoute([
      {x:p.garage.x,y:p.garage.y},
      {...p.fieldApproach},
      {x:p.field.x,y:p.field.y,tag:"harvest",waitMs:CONFIG.timings.harvestWaitMs},
      {...p.siloApproach},
      {x:p.silo.x,y:p.silo.y,tag:"unload_wheat",waitMs:CONFIG.timings.unloadWaitMs},
      {...p.garageApproach},
      {x:p.garage.x,y:p.garage.y},
    ]);
    this.vehicles.spawn({id:uid("combine"),type:"combine",eventId:"harvest_wheat",route});
    this.ui.closeSheet();this.ui.toast("🌾 Der Mähdrescher fährt zum Feld.");
  }

  completeHarvestStorage(closeSheet=false) {
    const plan=this.harvest.getPlan();
    if(!plan||!this.harvest.storeHarvest()){
      this.ui.toast("📦 Silo voll – die Ernte bleibt erhalten.");
      return false;
    }

    this.state.achievements.firstHarvest=true;
    if(closeSheet) this.ui.closeSheet();
    this.ui.toast(`🌾 +${plan.yieldAmount} ${this.crops.get(plan.cropId).name} im Silo`);

    if(this.state.missionId==="first_harvest"){
      this.advanceTo(5,"first_order","Erste Ernte eingelagert.");
    }else{
      this.save.save(this.state);
    }
    return true;
  }

  openSilo() {
    const s=this.state.silo;
    const actions=[];
    if(this.state.missionId==="storage_upgrade" && s.level<2 && !this.state.construction){
      const cost=this.economy.getValue("siloUpgrade");
      const canAfford=this.economy.canAfford(cost);
      actions.push({label:canAfford?`Verbessern · ${cost} F`:`${cost} F benötigt`,disabled:!canAfford,onClick:()=>this.startConstruction("silo",cost)});
    }
    this.ui.panel({eyebrow:"Lager",title:`Silo · Level ${s.level}`,body:`<div class="status">🌾 Weizen: <strong>${this.inventory.getQuantity("silo","wheat")}</strong><br>Kapazität: ${this.inventory.getUsed("silo")} / ${this.inventory.getCapacity("silo")}</div>`,actions});
  }

  openBarn() {
    const b=this.state.barn;
    this.ui.panel({eyebrow:"Lager",title:`Scheune · Level ${b.level}`,body:`<div class="status">Mehl: ${this.inventory.getQuantity("barn","flour")}<br>Eier: ${this.inventory.getQuantity("barn","eggs")}<br>Milch: ${this.inventory.getQuantity("barn","milk")}<br><br>Belegt: ${this.inventory.getUsed("barn")} / ${this.inventory.getCapacity("barn")}</div>`,actions:[]});
  }

  openGarage() {
    const g=this.state.garage;
    const actions=[];
    if(this.state.missionId==="workshop_chickens"&&g.level<2&&!this.state.construction){
      const cost=this.economy.getValue("garageUpgrade");
      const canAfford=this.economy.canAfford(cost);
      actions.push({label:canAfford?`Werkstatt verbessern · ${cost} F`:`${cost} F benötigt`,disabled:!canAfford,onClick:()=>this.startConstruction("garage",cost)});
    }
    const tr=this.state.machines.tractor?(this.state.machines.tractorRestored?"restauriert":"rostig"):"nicht vorhanden";
    const co=this.state.level>=4?(this.state.machines.combineRestored?"restauriert":"rostig"):"in der Werkstatt";
    this.ui.panel({eyebrow:"Maschinen",title:`Werkstatt · Level ${g.level}`,body:`<div class="status">🚜 Traktor: ${tr}<br>🌾 Mähdrescher: ${co}<br>🔧 Sämaschine/Anbaugeräte: in der Werkstatt</div>`,actions});
  }

  startConstruction(building,cost) {
    if(this.state.construction || !this.economy.spend(cost))return;
    const target=building==="silo"?POINTS.silo:POINTS.garage;
    this.vehicles.spawn({id:uid("builder"),type:"builder_van",eventId:`build_${building}`,route:routeTo(target,{tag:`build_${building}`,waitMs:2500})});
    this.ui.closeSheet();this.ui.toast("🔨 Das Handwerkerauto ist unterwegs.");
  }

  startMillerIntro() {
    if(this.vehicles.hasEvent("miller_intro"))return;
    this.vehicles.spawn({id:uid("miller"),type:"delivery_van",eventId:"miller_intro",route:routeTo(POINTS.loading,{tag:"miller_arrive",waitMs:3500})});
    this.state.missionStep=.5;this.ui.closeSheet();
  }

  openMill() {
    const s=this.state;
    if(!s.mill.unlocked){
      return this.ui.panel({eyebrow:"Mühle",title:"Noch stillgelegt",body:"<p>Die Mühle ist sichtbar, aber noch nicht Teil deines Hofbetriebs.</p>",actions:[]});
    }
    const actions=[];
    if(s.mill.outputReady>0){
      actions.push({label:`${s.mill.outputReady} Mehl einsammeln`,onClick:()=>this.collectFlour()});
    } else if(!s.mill.busy){
      const hasWheat=this.inventory.has("silo","wheat",5);
      actions.push({label:hasWheat?"5 Weizen → 2 Mehl":"5 Weizen benötigt",disabled:!hasWheat,onClick:()=>this.startFlour()});
    }
    let body=s.mill.busy?`<div class="status">Produktion läuft · ${formatTime(Math.max(0,Math.ceil((s.mill.readyAt-Date.now())/1000)))}</div>`:`<div class="status">Wasserrad: ${s.mill.unlocked?"aktiv":"still"}</div>`;
    this.ui.panel({eyebrow:"Produktion",title:"Mühle",body,actions});
  }

  startFlour() {
    if(this.state.mill.busy||!this.inventory.remove("silo","wheat",5))return;
    this.state.mill.busy=true;
    this.state.mill.readyAt=Date.now()+CONFIG.timings.flourMs;
    this.ui.closeSheet();this.ui.toast("⚙️ Die Mühle verarbeitet Weizen zu Mehl.");
  }

  collectFlour() {
    const qty=this.state.mill.outputReady;
    if(qty<=0)return;
    if(!this.inventory.add("barn","flour",qty)){
      this.ui.toast("📦 Scheune voll – Mehl bleibt an der Mühle.");
      return;
    }
    this.state.mill.outputReady=0;
    this.ui.closeSheet();this.ui.toast(`📦 +${qty} Mehl in der Scheune`);
    if(this.state.missionId==="miller_intro"){
      this.economy.credit(this.economy.getValue("millerReward"));
      this.advanceTo(7,"workshop_chickens","Müller-Auftrag abgeschlossen · +100 F");
    }
  }

  openChickens() {
    const c=this.state.chickens;
    if(!c.unlocked) return this.ui.panel({eyebrow:"Wiese",title:"Tierbereich",body:"<p>Hier ist später Platz für Hühner.</p>",actions:[]});
    const actions=[];
    if(c.eggsReady>0) actions.push({label:`${c.eggsReady} Eier einsammeln`,onClick:()=>this.collectEggs()});
    else if(!c.fed) {
      const hasFeed=this.inventory.has("silo","wheat",2);
      actions.push({label:hasFeed?"2 Weizen füttern":"2 Weizen benötigt",disabled:!hasFeed,onClick:()=>this.feedChickens()});
    }
    const body=`<div class="status">🐔 Hühner: ${c.count}<br>${c.fed?`Produktion: ${formatTime(Math.max(0,Math.ceil((c.readyAt-Date.now())/1000)))}`:c.eggsReady?"Eier bereit":"Futter benötigt"}</div>`;
    this.ui.panel({eyebrow:"Tiere",title:"Hühnerstall",body,actions});
  }

  feedChickens() {
    if(this.state.chickens.fed||!this.inventory.remove("silo","wheat",2))return;
    this.state.chickens.fed=true;this.state.chickens.readyAt=Date.now()+CONFIG.timings.eggsMs;
    this.ui.closeSheet();this.ui.toast("🌾 Die Hühner laufen zur Futterstelle.");
  }

  collectEggs() {
    const q=this.state.chickens.eggsReady;if(!q)return;
    if(!this.inventory.add("barn","eggs",q)){
      this.ui.toast("📦 Scheune voll – Eier bleiben am Hühnerstall.");
      return;
    }
    this.state.chickens.eggsReady=0;this.state.achievements.firstEggs=true;
    if(this.state.missionId==="eggs_baker") this.state.bakery.unlocked=true;
    this.ui.closeSheet();this.ui.toast(`🥚 +${q} Eier in der Scheune`);
  }

  openCows() {
    const c=this.state.cows;
    if(!c.unlocked) return this.ui.panel({eyebrow:"Wiese",title:"Kuhweide",body:"<p>Diese Fläche ist noch frei.</p>",actions:[]});
    const actions=[];
    if(c.milkReady>0) actions.push({label:`${c.milkReady} Milch einsammeln`,onClick:()=>this.collectMilk()});
    else if(!c.fed) {
      const hasFeed=this.inventory.has("silo","wheat",2);
      actions.push({label:hasFeed?"2 Weizen füttern":"2 Weizen benötigt",disabled:!hasFeed,onClick:()=>this.feedCows()});
    }
    const body=`<div class="status">🐄 Kühe: ${c.count}<br>${c.fed?`Produktion: ${formatTime(Math.max(0,Math.ceil((c.readyAt-Date.now())/1000)))}`:c.milkReady?"Milch bereit":"Futter benötigt"}</div>`;
    this.ui.panel({eyebrow:"Tiere",title:"Kuhweide",body,actions});
  }

  startCowDelivery() {
    if(this.vehicles.hasEvent("cow_delivery"))return;
    this.vehicles.spawn({id:uid("cows"),type:"animal_transport",eventId:"cow_delivery",route:routeTo(POINTS.cowpen,{tag:"cows_unload",waitMs:4500})});
    this.state.missionStep=.5;this.ui.closeSheet();this.ui.toast("🐄 Der Tiertransporter kommt.");
  }

  feedCows() {
    if(this.state.cows.fed||!this.inventory.remove("silo","wheat",2))return;
    this.state.cows.fed=true;this.state.cows.readyAt=Date.now()+CONFIG.timings.milkMs;
    this.ui.closeSheet();this.ui.toast("🌾 Die Kühe gehen zur Futterstelle.");
  }

  collectMilk() {
    const q=this.state.cows.milkReady;if(!q)return;
    if(!this.inventory.add("barn","milk",q)){
      this.ui.toast("📦 Scheune voll – Milch bleibt an der Kuhweide.");
      return;
    }
    this.state.cows.milkReady=0;
    this.ui.closeSheet();this.ui.toast(`🥛 +${q} Milch in der Scheune`);
  }

  openBakery() {
    if(!this.state.bakery.unlocked){
      return this.ui.panel({eyebrow:"Dorf",title:"Bäcker",body:"<p>Der Bäcker arbeitet noch nicht mit deinem Hof zusammen.</p>",actions:[]});
    }
    const actions=[];
    if(this.state.missionId==="eggs_baker"){
      const can=this.inventory.hasAll("barn",{eggs:2,flour:1});
      actions.push({label:can?"1 Mehl + 2 Eier liefern":"1 Mehl + 2 Eier benötigt",disabled:!can,onClick:()=>this.startBakerEggOrder()});
    }else if(this.state.missionId==="cows_milk"){
      const can=this.inventory.hasAll("barn",{milk:1,flour:1});
      actions.push({label:can?"1 Mehl + 1 Milch liefern":"1 Mehl + 1 Milch benötigt",disabled:!can,onClick:()=>this.startBakerMilkOrder()});
    }
    this.ui.panel({eyebrow:"Dorf",title:"Bäcker",body:`<div class="status">Mehl: ${this.inventory.getQuantity("barn","flour")}<br>Eier: ${this.inventory.getQuantity("barn","eggs")}<br>Milch: ${this.inventory.getQuantity("barn","milk")}</div>`,actions});
  }

  startBakerEggOrder() {
    if(!this.inventory.removeMany("barn",{eggs:2,flour:1}))return;
    this.vehicles.spawn({id:uid("baker"),type:"delivery_van",eventId:"baker_eggs",route:routeTo(POINTS.bakery,{tag:"baker_egg_delivery",waitMs:3000})});
    this.ui.closeSheet();
  }

  startBakerMilkOrder() {
    if(!this.inventory.removeMany("barn",{milk:1,flour:1}))return;
    this.vehicles.spawn({id:uid("baker"),type:"delivery_van",eventId:"baker_milk",route:routeTo(POINTS.bakery,{tag:"baker_milk_delivery",waitMs:3000})});
    this.ui.closeSheet();
  }

  openLoading() {
    const active=this.state.vehicles.filter(v=>["scrap_truck","flatbed","post_van","delivery_van"].includes(v.type));
    const offer=this.selling.getOffer("wheat");
    const pending=this.vehicles.hasEvent("sell_wheat");
    const can=this.selling.canSell("wheat")&&!pending;
    const label=pending
      ?"Verkauf läuft"
      :can
        ?`${offer.amount} ${offer.name} verkaufen · +${offer.reward} F`
        :`${offer.amount} ${offer.name} benötigt`;

    this.ui.panel({
      eyebrow:"Hofverkauf",
      title:"Verkaufstruck",
      body:`<p>Hier verkaufst du Hofware unabhängig von Aufträgen.</p><div class="status">🌾 Weizen im Silo: <strong>${offer.available}</strong><br>Verkauf: ${offer.amount} Weizen → <strong>${offer.reward} F</strong><br>Aktive Lieferfahrzeuge: ${active.length}</div>`,
      actions:[{label,disabled:!can,onClick:()=>this.startWheatSale()}]
    });
  }

  startWheatSale() {
    if(this.vehicles.hasEvent("sell_wheat"))return;

    const result=this.selling.sell("wheat");
    if(!result)return;

    this.vehicles.spawn({
      id:uid("sale"),
      type:"delivery_van",
      eventId:"sell_wheat",
      route:routeTo(POINTS.loading,{tag:"order_pickup",waitMs:3000}),
    });

    const wasTutorialSale=this.state.missionId==="first_order";
    this.ui.closeSheet();
    this.ui.toast(`🚚 ${result.amount} Weizen verkauft · +${result.reward} F`);

    if(wasTutorialSale){
      this.advanceTo(6,"storage_upgrade",`Erster Verkauf erledigt · +${result.reward} F`);
    }else{
      this.save.save(this.state);
    }
  }

  openLandmark(id) {
    const names={mine:"Bergwerk",sawmill:"Sägewerk",church:"Kirche",market:"Dorfmarkt",fishery:"Fischerei",harbor:"Hafen",lighthouse:"Leuchtturm"};
    const future=["mine","sawmill","fishery","harbor","lighthouse"].includes(id);
    this.ui.panel({eyebrow:future?"Späterer Spielbereich":"Tal",title:names[id]||id,body:future?"<p>Dieser Bereich gehört bereits zur Welt, wird aber erst nach der Einführung aktiv.</p>":"<p>Ein Teil deines Tals.</p>",actions:[]});
  }

  onVehicleArrive(vehicle,tag) {
    if(tag==="scrap_pickup"){
      this.state.world.scrapVisible=false;this.inventory.remove("inventory","scrap",1);this.ui.toast("🧹 Der Hof wird sichtbar aufgeräumt.");
    }
    if(tag==="seed_delivery"){
      this.planting.receiveSeed("wheat",1);
      if(this.state.missionId==="first_seed") this.state.missionStep=1;
      this.ui.toast("📦 Weizensaatgut ist angekommen.");
    }
    if(tag==="miller_arrive"){
      this.state.mill.unlocked=true;this.state.missionStep=1;this.ui.toast("🌾 Die Mühle ist jetzt aktiv.");
    }
    if(tag==="build_silo" && !this.state.construction){
      this.state.construction={building:"silo",startAt:Date.now(),endAt:Date.now()+CONFIG.timings.constructionMs};
    }
    if(tag==="build_garage" && !this.state.construction){
      this.state.construction={building:"garage",startAt:Date.now(),endAt:Date.now()+CONFIG.timings.constructionMs};
    }
    if(tag==="harvest"){
      this.harvest.markHarvesting();
    }
    if(tag==="cows_unload"){
      this.state.cows.unlocked=true;this.state.cows.count=2;this.state.missionStep=1;
    }
  }

  onVehicleLeave(vehicle,tag) {
    if(tag==="gift_unload"){
      this.state.machines.tractor=true;this.state.machines.seeder=true;this.ui.toast("🚜 Alter Traktor + Sämaschine erhalten.");
    }
    if(tag==="sow"){
      const plantedAt=Date.now();
      if(!this.planting.completeSowing("wheat",plantedAt)){
        this.ui.toast("⚠️ Aussaat konnte nicht abgeschlossen werden.");
        return;
      }
      if(this.state.missionId==="first_seed") this.advanceTo(4,"first_harvest","Erste Aussaat geschafft.");
    }
    if(tag==="harvest"){
      this.harvest.finishCutting();
    }
    if(tag==="unload_wheat"){
      this.completeHarvestStorage();
    }
    if(tag==="chickens_unload"){
      this.state.chickens.unlocked=true;this.state.chickens.count=4;
    }
  }

  onVehicleComplete(vehicle) {
    switch(vehicle.eventId){
      case "scrap_sale":
        this.economy.credit(this.economy.getValue("scrapReward"));
        this.advanceTo(2,"friend_gift","Schrott verkauft · +100 F");
        break;
      case "friend_gift":
        this.advanceTo(3,"first_seed","Deine ersten Maschinen sind da.");
        break;
      case "chicken_delivery":
        this.advanceTo(8,"eggs_baker","Die Hühner sind angekommen.");
        break;
      case "baker_eggs":
        this.economy.credit(this.economy.getValue("bakerEggReward"));
        this.advanceTo(9,"cows_milk","Bäckerauftrag erledigt · +80 F");
        break;
      case "baker_milk":
        this.economy.credit(this.economy.getValue("bakerMilkReward"));
        this.state.level=10;this.state.xp=0;this.state.missionId="tutorial_done";this.state.tutorialComplete=true;this.state.achievements.tutorialDone=true;
        this.ui.toast("⭐ Level 10 – Die Einführung ist abgeschlossen!",4200);
        break;
    }
    this.save.save(this.state);
  }

  onConstructionComplete(c) {
    if(c.building==="silo"){
      this.state.silo.level=2;this.state.silo.capacity=60;
      if(this.state.missionId==="storage_upgrade"){
        this.state.missionId="miller_intro";this.state.missionStep=0;
        this.ui.toast("✅ Silo Level 2 fertig. Der Müller meldet sich.");
      }
    }
    if(c.building==="garage"){
      this.state.garage.level=2;
      this.state.machines.tractorRestored=true;this.state.machines.combineRestored=true;
      if(this.state.missionId==="workshop_chickens"){
        this.inventory.add("silo","wheat",4); // starter feed
        this.vehicles.spawn({id:uid("chickens"),type:"animal_transport",eventId:"chicken_delivery",route:routeTo(POINTS.coop,{tag:"chickens_unload",waitMs:4000})});
        this.ui.toast("🔧 Maschinen restauriert. Der Tiertransporter ist unterwegs.");
      }
    }
    this.save.save(this.state);
  }

  // chicken delivery completes level 8 entry only after transporter returns
  postVehicleReconcile() {
    // Reserved for later multi-event chaining.
  }

  advanceTo(level,missionId,message) {
    this.state.level=level;this.state.xp=0;this.state.xpNeeded=Math.round(100+(level-1)*35);this.state.missionId=missionId;this.state.missionStep=0;
    this.ui.closeSheet();this.ui.toast(`⭐ Level ${level} · ${message}`,3200);this.save.save(this.state);
  }

  devAction(action) {
    const s=this.state;
    if(action==="money") this.economy.credit(1000);
    if(action==="xp") s.xp=Math.min(s.xpNeeded,s.xp+100);
    if(action==="grow" && ["growing","sowing"].includes(s.field.status)){s.field.status="ready";s.field.readyAt=null;}
    if(action==="finish") this.timeSystems.forceFinishAll();
    if(action==="sunny") s.world.weather="sunny";
    if(action==="rain") s.world.weather="rain";
    if(action==="fog") s.world.weather="fog";
    if(action==="speed") s.world.timeScale=20;
    if(action==="normal") s.world.timeScale=1;
    if(action==="debug") s.world.debug=!s.world.debug;
    this.save.save(s);this.ui.updateHUD(s);
  }

  devStats() {
    return `FPS: ${this.renderer.fps}
Level: ${this.state.level}
Mission: ${this.state.missionId} / ${this.state.missionStep}
Vehicles: ${this.state.vehicles.length}
Camera: ${Math.round(this.camera.x)}, ${Math.round(this.camera.y)} @ ${this.camera.zoom.toFixed(2)}
Weather: ${this.state.world.weather}
TimeScale: ${this.state.world.timeScale}x`;
  }

  // Level 7 waits for the chicken transporter. This is called by main update hook via event.
  finalizeChickenDelivery() {
    if(this.state.missionId==="workshop_chickens" && this.state.chickens.unlocked){
      this.advanceTo(8,"eggs_baker","Die Hühner sind angekommen.");
    }
  }
}

function uid(prefix){return `${prefix}_${Date.now()}_${Math.floor(Math.random()*9999)}`;}
function formatTime(sec){const m=Math.floor(sec/60),s=Math.max(0,sec%60);return `${m}:${String(s).padStart(2,"0")}`;}
function statusName(s){return ({prepared:"vorbereitet",sowing:"wird gesät",growing:"wächst",ready:"erntereif",harvest_starting:"Mähdrescher unterwegs",harvesting:"wird geerntet",harvested:"abgeerntet"}[s]||s);}
