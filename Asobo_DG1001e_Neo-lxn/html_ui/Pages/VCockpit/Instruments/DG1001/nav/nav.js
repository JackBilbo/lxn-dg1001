class B21_publisher extends BasePublisher {
    constructor(bus, pacer = undefined) {
        super(bus, pacer);
    }

    onupdate() {
        console.log("B21 Publisher Update");
        this.publishFinishHeight();
    }

    publishFinishHeight() {
        let arr_agl = B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m - (B21_SOARING_ENGINE.task.finish_wp().min_alt_m != null ? B21_SOARING_ENGINE.task.finish_wp().min_alt_m : B21_SOARING_ENGINE.task.finish_wp().alt_m);
        console.log("PUB: " + arr_agl);
        this.publish('b21_arr_height_agl', arr_agl);
    }
}


let NAVMAP, TOPOMAP, LX;

class AS9070 extends ASShared {
    constructor() {
        super('AS9070');

        this.jbb_lift_dot_delay = 3;
        this.lift_dots = [];
        this.lift_dots_max = 40;
        this.showLiftdots = true;

        this.backplane.addPublisher('b21_data', new B21_publisher(this.bus));

        this.TIMER_1 = 0;

        // Constants
        this.MS_TO_KNOTS = 1.94384; // speed conversion consts
        this.MS_TO_KPH = 3.6;    // meter per second to kilometer per hour
        this.M_TO_FEET = 3.28084;   // meter to foot
        this.M_TO_NM = 1 / 1852; // Meters to Nautical Miles.
        this.M_TO_MILES = 1 / 1609.34; // Meters to Statute Miles
        this.MS_TO_FPM = 196.85; // meter per second to foot per minute
        this.RAD_TO_DEG = 57.295; // Radians to degrees
    }
    
    connectedCallback() {
        super.connectedCallback();
        console.log("CONNECTED");
        
        AS9070.menuSystem = new MenuSystem(this.bus, 8);
        AS9070.menuSystem.addMenu('startUpProfileMenu', new StartUpProfileMenu(AS9070.menuSystem, this.modeViewService));
        AS9070.menuSystem.addMenu('StartUpQNHMenu', new StartUpQNHMenu(AS9070.menuSystem, this.modeViewService, QNHAndResUserSettings.getManager(this.bus)));
        AS9070.menuSystem.addMenu('editMenu', new EditMenu(AS9070.menuSystem, false));
        AS9070.menuSystem.addMenu('fieldMenu', new FieldMenu(AS9070.menuSystem, false));
        AS9070.menuSystem.addMenu('infoMenu', new InfoMenu(AS9070.menuSystem, false));
        AS9070.menuSystem.addMenu('setupMenu', new SetupMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('graphicsMenu', new GraphicsMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('QNHandRESMenu', new QNHAndResMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('NearMenu', new NearMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('VarioParametersMenu', new VarioParametersMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('PolarMenu', new PolarMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('HardwareMenu', new HardwareMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('VarioIndicatorMenu', new VarioIndicatorMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('AboutMenu', new AboutMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('AirportModeMenu', new AirportModeMenu(AS9070.menuSystem));
        AS9070.menuSystem.addMenu('McBalPopUpMenu', new McBalPopUpMenu(AS9070.menuSystem));
        this.modeViewService.registerView('StartUpLogoPage', () => (FSComponent.buildComponent(StartUpLogoPage, { AS_name: 'AS9070', bus: this.bus, menuSystem: AS9070.menuSystem, title: 'StartUp Logo Page' })));
        this.modeViewService.registerView('StartUpProfilePage', () => (FSComponent.buildComponent(StartUpProfilePage, { menuSystem: AS9070.menuSystem, aircraftName: this.aircraftName, title: 'Profile' })));
        this.modeViewService.registerView('StartUpQNHPage', () => (FSComponent.buildComponent(StartUpQNHPage, { bus: this.bus, menuSystem: AS9070.menuSystem, QNHAndResSettings: QNHAndResUserSettings.getManager(this.bus), title: 'Elevation and QNH' })));
        this.modeViewService.registerView('AirportMode', () => (FSComponent.buildComponent(AirportMode, { bus: this.bus, mapSize: new Float64Array([480, 800]), menuSystem: AS9070.menuSystem, flightPlanner: this.planner, fms: this.fms, loader: this.loader, flarm: this.flarm, title: 'Airport' })));
        this.modeViewService.registerView('NearMode', () => (FSComponent.buildComponent(NearMode, { loader: this.loader, bus: this.bus, menuSystem: AS9070.menuSystem, fms: this.fms, viewService: this.modeViewService, title: 'Near' })));
        this.modeViewService.registerView('InfoMode', () => (FSComponent.buildComponent(InfoMode, { bus: this.bus, menuSystem: AS9070.menuSystem, title: 'Info' })));
        this.modeViewService.registerView('SetupMode', () => (FSComponent.buildComponent(SetupMode, { viewService: this.modeViewService, bus: this.bus, menuSystem: AS9070.menuSystem, title: 'Setup' })));
        this.modeViewService.registerView('QNHAndResPage', () => (FSComponent.buildComponent(QNHAndResPage, { bus: this.bus, viewService: this.modeViewService, menuSystem: AS9070.menuSystem, QNHAndResSettings: QNHAndResUserSettings.getManager(this.bus), title: 'QNH and RES' })));
        this.modeViewService.registerView('VarioParametersPage', () => (FSComponent.buildComponent(VarioParametersPage, { bus: this.bus, viewService: this.modeViewService, menuSystem: AS9070.menuSystem, title: 'Vario Parameters' })));
        this.modeViewService.registerView('HardwarePage', () => (FSComponent.buildComponent(HardwarePage, { title: 'Hardware', bus: this.bus, menuSystem: AS9070.menuSystem, viewService: this.modeViewService })));
        this.modeViewService.registerView('PolarPage', () => (FSComponent.buildComponent(PolarPage, { title: 'Polar Setup', menuSystem: AS9070.menuSystem, bus: this.bus, viewService: this.modeViewService })));
        this.modeViewService.registerView('VarioIndicatorPage', () => (FSComponent.buildComponent(VarioIndicatorPage, { title: 'AS8 indicator Sn:04269', bus: this.bus, menuSystem: AS9070.menuSystem, viewService: this.modeViewService })));
        this.modeViewService.registerView('AboutPage', () => (FSComponent.buildComponent(AboutPage, { title: 'About', bus: this.bus, menuSystem: AS9070.menuSystem, viewService: this.modeViewService })));
        FSComponent.render(FSComponent.buildComponent(SoftKeyRenderer, { menuSystem: AS9070.menuSystem, softkeyIndexMapping: AS9070_SoftKey_Mapping }), document.getElementById('Menu'));
    
        LX = this;
        NAVMAP = new navmap(this);
        B21_SOARING_ENGINE.register_callback(this, this.engine_event_callback);
    }

    get templateID() {
        return 'AS9070';
    }

    Update() {
        super.Update();
        this.TIME_S = SimVar.GetSimVarValue("E:SIMULATION TIME","seconds");
        this.WIND_DIRECTION_DEG = SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees");
        this.WIND_SPEED_MS = SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "meters per second");
        this.NETTO_MS = SimVar.GetSimVarValue("Z:B21_NETTO_MS","meters per second"); // From b21_soaring_engine_class
        this.TE_MS = SimVar.GetSimVarValue("Z:B21_TE_MS", "number"); // From model xml
        this.MACCREADY_MS = SimVar.GetSimVarValue("Z:B21_MACCREADY_MS", "meters per second");
        this.PLANE_POSITION = this.get_position();
        this.AIRSPEED_MS = SimVar.GetSimVarValue("A:AIRSPEED TRUE", "feet per second") / this.M_TO_FEET;
        //this.ALTITUDE_M = SimVar.GetSimVarValue("A:INDICATED ALTITUDE", "feet") / this.M_TO_FEET;
        this.ALTITUDE_M = SimVar.GetSimVarValue("A:PLANE ALTITUDE", "feet") / this.M_TO_FEET;

        this.STF_SPEED_0_MS = SimVar.GetSimVarValue("VARIOMETER SPEED TO FLY:1","kilometers per hour") / this.MS_TO_KPH; // From LX_S100
        this.STF_SINK_0_MS = -(this.STF_SPEED_0_MS / SimVar.GetSimVarValue("VARIOMETER SPEED TO FLY GLIDE RATIO:1","number")); // From LX_S100 (sink is negative)
        
        if(B21_SOARING_ENGINE.task_active() && !NAVMAP.map_instrument_loaded) {
            NAVMAP.load_map();
        }

        if(NAVMAP.map_instrument_loaded) {
            NAVMAP.update_map();
        }

        this.jbb_update_hawk();
        this.updateDatafields();

        if(this.TIME_S - this.TIMER_1 > 1) {
            /* Stuff happening every second ********************************************************* */
            this.TIMER_1 = this.TIME_S;
            this.updateLiftdots();
            
        }

        if(this.lift_dots_timer_prev == null) {
            this.lift_dots_timer_prev = this.TIME_S;
        }

        if(this.TIME_S - this.lift_dots_timer_prev > this.jbb_lift_dot_delay && SimVar.GetSimVarValue("A:AIRSPEED INDICATED", "knots") > 40 && this.showLiftdots) {
            this.lift_dots_timer_prev = this.TIME_S;
            this.addLiftdot()
        }


        /* keybindings */

          this.KNOBS_VAR = ("0000" + SimVar.GetSimVarValue("TRANSPONDER CODE:1", "number")).slice(-4); // knobs encoded in 4 digits of XPNDR
          if(this.prev_knobs_var == null ) { this.prev_knobs_var = this.KNOBS_VAR; }


            if (this.knob_delta(this.prev_knobs_var[2], this.KNOBS_VAR[2]) == -1) {
              this.prev_knobs_var = this.KNOBS_VAR;
              NAVMAP.zoom_out();
          }
  
          if (this.knob_delta(this.prev_knobs_var[2], this.KNOBS_VAR[2]) == 1) {
              this.prev_knobs_var = this.KNOBS_VAR;
              NAVMAP.zoom_in();
          }
  
          if (this.knob_delta(this.prev_knobs_var[0], this.KNOBS_VAR[0]) == -1) {
              this.prev_knobs_var = this.KNOBS_VAR;
              if(B21_SOARING_ENGINE.task_index() < B21_SOARING_ENGINE.task_length() -1 ) {
                  B21_SOARING_ENGINE.change_wp(1);
              }
           }
   
           if (this.knob_delta(this.prev_knobs_var[0], this.KNOBS_VAR[0]) == 1) {
              this.prev_knobs_var = this.KNOBS_VAR;
              if(B21_SOARING_ENGINE.task_index() > 0) {
                  B21_SOARING_ENGINE.change_wp(-1);
              }
           }
  
           if(this.prev_knobs_var[3] != this.KNOBS_VAR[3]) {
              this.prev_knobs_var = this.KNOBS_VAR;
              if(NAVMAP.map_rotation == "trackup") {
                  NAVMAP.map_rotation = "northup";
              } else {
                  NAVMAP.map_rotation = "trackup";
              }
              NAVMAP.set_map_rotation(NAVMAP.map_rotation);
           }
    }

    // Given a,b as digit 0..7, return -1, 0, +1 for delta of a -> b, modulo 7
    knob_delta(a,b) {
        //console.log("knob_delta a:"+a+" b:"+b);
        let delta = parseInt(b) - parseInt(a);
        if (delta == 0) {
            return delta;
        }
        return (delta < -4) || (delta > 0 && delta < 4) ? 1 : -1;
    }

    get_position() {
        return new LatLong(SimVar.GetSimVarValue("A:PLANE LATITUDE", "degrees latitude"),
            SimVar.GetSimVarValue("A:PLANE LONGITUDE", "degrees longitude"));
    }

    builddatafields() {
        document.querySelectorAll('.datafield').forEach(el => {
            el.innerHTML = '<span class="label"></span><div class="value"><span class="number"></span><span class="unit"></span></div>';
        })

        this.feedData();
    }

    feedData() {
        const windSub = this.bus.getSubscriber();
        windSub.on('radio_alt').atFrequency(1).handle((v) => {
            let alt = UnitType.FOOT.convertTo(v, UnitType.METER);
            document.querySelector("#cell_0_5 .label").innerText = "ALT AGL";
            document.querySelector("#cell_0_5 .number").innerText = alt.toFixed(0);
            document.querySelector("#cell_0_5 .unit").innerText = "m";
        });

        const te = this.bus.getSubscriber();
        te.on('total_energy').atFrequency(1).handle((v) => {
            SimVar.SetSimVarValue("Z:B21_TE_MS","number", v)
        })

        const net = this.bus.getSubscriber();
        net.on('netto').atFrequency(1).handle((v) => {
              
        })

        const mc = this.bus.getSubscriber();
        mc.on('mac_cready_setting').atFrequency(1).handle((v) => {
              SimVar.SetSimVarValue("Z:B21_MACCREADY_MS","meters per second", v);
        })

        const stf = this.bus.getSubscriber();
        stf.on('speed_to_fly').atFrequency(1).handle((v) => {
            SimVar.SetSimVarValue("Z:B21_STF_SPEED_MS", "meters per second", v / this.MS_TO_KPH);
            document.querySelector("#cell_0_6 .label").innerText = "STF";
            document.querySelector("#cell_0_6 .number").innerText = v.toFixed(0);
            document.querySelector("#cell_0_6 .unit").innerText = "kmh";
        })
  
        const task_arr = this.bus.getSubscriber();
        task_arr.on('b21_arr_height_agl').atFrequency(1).handle((v) => {
            
        })

    }

    updateDatafields() {
        if(B21_SOARING_ENGINE.task_active()) {

            document.querySelector("#cell_0_1 .label").innerText = "WP BRG";
            document.querySelector("#cell_0_1 .number").innerText = (B21_SOARING_ENGINE.current_wp().bearing_deg).toFixed(0);
            document.querySelector("#cell_0_1 .unit").innerText = "deg"; 

            document.querySelector("#cell_0_2 .label").innerText = "WP DIST";
            document.querySelector("#cell_0_2 .number").innerText = (B21_SOARING_ENGINE.current_wp().distance_m / 1000).toFixed(0);
            document.querySelector("#cell_0_2 .unit").innerText = "km"; 
        
            document.querySelector("#cell_0_3 .label").innerText = "WP ETE";
            document.querySelector("#cell_0_3 .number").innerText = (B21_SOARING_ENGINE.current_wp().ete_s / 60).toFixed(0);
            document.querySelector("#cell_0_3 .unit").innerText = "min"; 
        
            document.querySelector("#cell_0_4 .label").innerText = "WP ARR AGL";
            document.querySelector("#cell_0_4 .number").innerText = (B21_SOARING_ENGINE.current_wp().arrival_height_msl_m - B21_SOARING_ENGINE.current_wp().alt_m).toFixed(0);
            document.querySelector("#cell_0_4 .unit").innerText = "m"; 

            document.querySelector("#cell_0_7 .label").innerText = "TASK AVG";
            document.querySelector("#cell_0_7 .number").innerText = (B21_SOARING_ENGINE.task_finished() ? B21_SOARING_ENGINE.finish_speed_ms() * 3.6 : B21_SOARING_ENGINE.task.avg_task_speed_kts() * 1.852).toFixed(0);
            document.querySelector("#cell_0_7 .unit").innerText = "kmh"; 

            document.querySelector("#cell_0_8 .label").innerText = "FINISH";
            document.querySelector("#cell_0_8 .number").innerText =  (B21_SOARING_ENGINE.task.finish_wp().arrival_height_msl_m - (B21_SOARING_ENGINE.task.finish_wp().min_alt_m != null ? B21_SOARING_ENGINE.task.finish_wp().min_alt_m : B21_SOARING_ENGINE.task.finish_wp().alt_m)).toFixed(0);
            document.querySelector("#cell_0_8 .unit").innerText = "m"; 
        
            let tasktime;
            if(!B21_SOARING_ENGINE.task_finished()) {
                tasktime = B21_SOARING_ENGINE.task_time_s()
            } else {
                tasktime = B21_SOARING_ENGINE.task.finish_time_s - B21_SOARING_ENGINE.task.start_time_s;
            }

            let timefmt = DurationFormatter.create('{HH}:{mm}:{ss}', UnitType.SECOND, '--:--:--');
            document.querySelector("#task-timer").innerText =  timefmt(tasktime);

            document.querySelector("#task-wpt-name").innerText = "WPT: " + B21_SOARING_ENGINE.current_wp().name;
        }
        
        

    }


    addLiftdot() {
        let position = this.get_position();
        let netto = SimVar.GetSimVarValue("A:VARIOMETER NETTO:1","kts");
        let color = netto > 0 ? "#14852c" : "#cc0000";
        let radius = Math.max(15, Math.min(Math.abs(netto) * 20, 75));
    
        if(typeof(TOPOMAP.addLayer) == "function") {
            let newdot = L.circle([position.lat, position.long], radius, {
                color: color,
                stroke: 0,
                fillColor: color,
                fillOpacity: 1,
                type: "liftdot"
            }).addTo(TOPOMAP);

            this.lift_dots.unshift( newdot );
        }


    }

    updateLiftdots() {

        for(let i = 0; i < this.lift_dots.length; i++) {
            this.lift_dots[i].setStyle({
                fillOpacity: (40-i)/40
            })

            if(i > this.lift_dots_max) {
                TOPOMAP.removeLayer(this.lift_dots[i]);
                this.lift_dots.pop();
            }

            if(!this.showLiftdots) { TOPOMAP.removeLayer(this.lift_dots[i]); }
        }
        
        // Dot Trail deactivated, clear Dot-Array
        if(!this.showLiftdots) { this.lift_dots = []; }
    }


    jbb_update_hawk() {
        let current_wind_direction = SimVar.GetSimVarValue("A:AMBIENT WIND DIRECTION", "degrees");
        this.hawkwinddir = this.hawkwinddir != null ? (0.9 * this.hawkwinddir) + (0.1 * current_wind_direction) : current_wind_direction;
        this.jbb_avg_wind_direction = this.jbb_avg_wind_direction != null ? ((0.99 * this.jbb_avg_wind_direction) + (0.01 * this.hawkwinddir)) : this.hawkwinddir;

        let averageindicator = this.jbb_avg_wind_direction;
       
        let current_wind_speed = SimVar.GetSimVarValue("A:AMBIENT WIND VELOCITY", "meters per second") * 1.94384;
        this.hawkwindspeed = this.hawkwindspeed != null ? (0.9 * this.hawkwindspeed) + (0.1 * current_wind_speed) : current_wind_speed; 
        this.jbb_avg_wind_speed = this.jbb_avg_wind_speed != null ? ((0.99 * this.jbb_avg_wind_speed) + (0.01 * this.hawkwindspeed)) : this.hawkwindspeed;

        document.querySelector("#hawk #arrow_avg").style.transform = "rotate(" + (NAVMAP.map_rotation == "trackup" ? averageindicator - SimVar.GetSimVarValue("A:PLANE HEADING DEGREES TRUE","degrees") : averageindicator) + "deg)";
        document.querySelector("#hawk #arrow_current").style.transform = "rotate(" + (NAVMAP.map_rotation == "trackup" ? this.hawkwinddir - SimVar.GetSimVarValue("A:PLANE HEADING DEGREES TRUE","degrees") : this.hawkwinddir) + "deg)";

        let wv = Math.min(400, this.hawkwindspeed * 10 + 85);
        document.querySelector("#hawk #arrow_current").style.height = wv +"px";
        document.querySelector("#hawk #arrow_current").style.top = -wv/2 +"px";

        let wvavg = Math.min(400, this.jbb_avg_wind_speed * 10 + 85);
        document.querySelector("#hawk #arrow_avg").style.height = wvavg +"px";
        document.querySelector("#hawk #arrow_avg").style.top = -wvavg/2 +"px";
        

        // Vertical wind indication

        let verticalwind = SimVar.GetSimVarValue("A:AMBIENT WIND Y", "knots");
        this.avg_vert_wind = this.avg_vert_wind != null ? ((0.9 * this.avg_vert_wind) + (0.1 * verticalwind)) : verticalwind;

        if(verticalwind < 0) {
            document.querySelector("#hawkbar").classList.add("negative");
        } else {
            document.querySelector("#hawkbar").classList.remove("negative");
        }

        document.querySelector("#hawkbar").style.height =  Math.abs(this.avg_vert_wind * 18) + "px";
        document.querySelector("#hawkbar .value").innerText = Math.abs(this.avg_vert_wind).toFixed(1);
    }




        /****************************************************************************************/

    // Task Management by B21 Soaring Engine  //

    popalert(headline,text,dur,col) {
        let d = dur != null ? dur : 5;
        let c = col != null ? col : "#ff0000";
        let pop = document.getElementById("alert");
        pop.querySelector("h2").innerHTML = headline;
        pop.querySelector("p").innerHTML = text;
        pop.style.backgroundColor = c;

        pop.style.display = "block";
        window.setTimeout(function() { pop.style.display = "none"; }, d * 1000);
        
    }


    engine_event_callback(event_name, args) {
        console.log("Soaring engine event "+event_name, args);
        let WP = args["wp"];

        switch (event_name) {
            case "TASK_WP_CHANGE":
                // this.update_task_page(); // { wp }
                NAVMAP.updateTaskline();
                break;

            case "TASK_WP_COMPLETED":
                this.message_task_wp_completed(WP); // { wp }
                break;

            case "TASK_WP_NOT_COMPLETED":
                this.message_task_wp_not_completed(WP); // { wp }
                break;

            case "TASK_START":
                this.message_task_start(WP, args["start_local_time_s"], args["start_alt_m"]); // { wp, start_local_time_s, start_alt_m }
                break;

            case "TASK_START_TOO_LOW":
                this.message_task_start_too_low(WP); // { wp }
                break;

            case "TASK_START_TOO_HIGH":
                this.message_task_start_too_high(WP); // { wp }
                break;

            case "TASK_FINISH":
                this.message_task_finish(WP, args["finish_speed_ms"], args["completion_time_s"]); // { wp }
                break;

            case "TASK_FINISH_TOO_LOW":
                this.message_task_finish_too_low(WP); // { wp }
                break;

            case "TASK_FINISH_TOO_HIGH":
                this.message_task_finish_too_high(WP); // { wp }
                break;

            default:
                console.log("engine event unrecognized "+event_name, args);

        }
    }


    // ***********************************************************************************
    // *************** B21 Popup Messages                          *******************
    // ***********************************************************************************
    //  this.message_task_wp_completed(WP);
    //  this.message_task_wp_not_completed(WP);
    //  this.message_task_start(WP, start_local_time_s, start_alt_m);
    //  this.message_task_start_too_low(WP);
    //  this.message_task_start_too_high(WP);
    //  this.message_task_finish(WP, finish_speed_ms, completion_time_s);
    //  this.message_task_finish_too_low(WP);
    //  this.message_task_finish_too_high(WP);

    engine_task_wp_change(args) {

    }

    // Start the task
    message_task_start(wp, start_local_time_s, start_alt_m) {
        // Display "TASK START" message
        let hl = "TASK STARTED ";
        let timefmt = DurationFormatter.create('{HH}:{mm}:{ss}', UnitType.SECOND, '--:--:--');
        let t = timefmt(start_local_time_s)+"<br/>";
        t += wp.name+"<br/>";
        t += this.ALTITUDE_M.toFixed(0) + "m";
        // this.task_message(msg_str, 5); // Display start message for 5 seconds
        this.popalert(hl,t,5,"#26783c");
    }

    message_task_start_too_low(wp) {
        // Display started too low message
        let hl = "BAD START";
        let msg_str = "<br/>" + this.ALTITUDE_M + "m";
        msg_str += "<br/>&gt;&gt;&nbsp;TOO LOW&nbsp;&lt;&lt;";
        msg_str += "<br/>MIN HEIGHT: " + wp.min_alt_m.tofixed(0) + "m";
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

    message_task_start_too_high(wp) {
        // Display started too low message
        let hl = "BAD START";
        let msg_str = "<br/>" + this.ALTITUDE_M + "m";;
        msg_str += "<br/>&gt;&gt;&nbsp;TOO HIGH&nbsp;&lt;&lt;";
        msg_str += "<br/>MAX HEIGHT: " + wp.min_alt_m.tofixed(0) + "m";
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

    message_task_wp_completed(wp) {
        // this.task_message(wp.name+" OK",2);
        this.popalert(wp.name+" OK","",3,"#26783c");
    }

    message_task_wp_not_completed(wp) {
        // this.task_message(wp.name+"<br/>NOT TASK",3,true);
        this.popalert(wp.name+" NOT TASK","",3,"#ff0000");
    }

    message_task_finish(wp, finish_speed_ms, completion_time_s) {
        // Display "TASK COMPLETED" message
        let hl = "TASK COMPLETED ";
        let msg_str = finish_speed_ms + "<br/>";
        let timefmt = DurationFormatter.create('{HH}:{mm}:{ss}', UnitType.SECOND, '--:--:--');
        let t = timefmt(parseInt(SimVar.GetSimVarValue("E:LOCAL TIME","seconds")))+"<br/>";
        msg_str += wp.name+"<br/>";
        // this.task_message(msg_str, 10); // Display start message for 3 seconds
        this.popalert(hl,msg_str,5,"#26783c");
    }

    message_task_finish_too_low(wp) {
        // Display finished too low message
        let hl = "BAD FINISH";
        let msg_str = this.ALTITUDE_M.toFixed(0) + "m";
        msg_str += "<br/>&gt;&gt;&nbsp;TOO LOW&nbsp;&lt;&lt;";
        msg_str += "<br/>MIN HEIGHT: " + wp.min_alt_m.tofixed(0) + "m";
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

    message_task_finish_too_high(wp) {
        // Display started too low message
        let hl = "BAD FINISH";
        let msg_str = this.ALTITUDE_M.toFixed(0) + "m";
        msg_str += "<br/>&gt;&gt;&nbsp;TOO HIGH&nbsp;&lt;&lt;";
        msg_str += "<br/>MAX HEIGHT: " + wp.max_alt_m.tofixed(0) + "m";
        // this.task_message(msg_str, 6, true); // Display start message for 5 seconds
        this.popalert(hl,msg_str,5,"#ff0000");
    }

}
registerInstrument('glasscockpit-axnav-as9070', AS9070);