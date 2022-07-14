/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Component({
  selector: 'app-control-iot',
  templateUrl: './control-iot.component.html',
  styleUrls: ['./control-iot.component.scss'],
})
export class ControlIotComponent implements OnInit {

  seccion: 'temp' | 'contr' | 'hist' = 'temp';
  mediciones: Mediciones[] = [];

  lastMedicion: Mediciones = {
    sensor: null,
    time: null,
  };

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  umbral: number = 25;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ventilador_state: boolean = null;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  ventilador: number = 0;
  version = 0;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  control_Nivel: boolean = false;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  control_Temperatura: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  control_Presion: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  manual: boolean = false;

  constructor(public database: AngularFireDatabase) {
    this.leerMediciones();
    this.clearVersion();
    this.leerStateVentilador();
    this.setManual();
  }

  ngOnInit() {}

  leerMediciones(){
    const path = 'mediciones/';
    this.database.list<Mediciones>(path, ref => ref.orderByChild('time').limitToLast(20)).valueChanges().subscribe(res => {
      console.log('mediciones -> ', res);
      this.mediciones = res;
      this.mediciones.reverse();
      this.lastMedicion = this.mediciones[0];
    });
  }

  leerStateVentilador() {
    const path = 'ventilador_state';
    this.database.object<boolean>(path).valueChanges().subscribe(res => {
      if (res !== undefined){
        this.ventilador_state = res;
      }
    });
  }

  segmentChanged(ev: any){
    this.seccion = ev.detail.value;
    console.log('ev -> ', ev.detail.value);
  };

  rangeChange(ev: any){
    this.umbral = ev.detail.value;
    //console.log('ev -> ', ev.detail.value);
    const path = 'umbral';
    this.database.object(path).set(this.umbral);
    this.version = this.version + 1;
    this.database.object('version').set(this.version);
  };

  clearVersion(){
    const path = 'version';
    this.database.object(path).set(0);
  };

  toggleChangeNivel(ev: any){
    const path = 'control_Nivel';
    if (ev.detail.checked){
      this.database.object(path).set('1');
    } else {
      this.database.object(path).set('0');
    }
  }

  toggleChangeTemperatura(ev: any){
    const path = 'control_Temperatura';
    if (ev.detail.checked){
      this.database.object(path).set('1');
    } else {
      this.database.object(path).set('0');
    }
  }

  toggleChangePresion(ev: any){
    const path = 'control_Presion';
    if (ev.detail.checked){
      this.database.object(path).set('1');
    } else {
      this.database.object(path).set('0');
    }
  }

  toggleChange(ev: any){
    console.log('ev -> ', ev.detail.checked);
    this.manual = ev.detail.checked;
    if(!this.manual){
      const path = 'ventilador';
      this.database.object(path).set(0);
      this.version = this.version + 1;
      this.database.object('version').set(this.version);
    }
  }

  toggleChangePrender(ev: any){
    const path = 'ventilador';
    if (ev.detail.checked){
      this.database.object(path).set(1);
    } else {
      this.database.object(path).set(2);
    }
    this.version = this.version + 1;
    this.database.object('version').set(this.version);
  }

  setManual(){
    const path = 'ventilador';
    this.database.object<number>(path).valueChanges().subscribe(res => {
      if (res > 0){
        this.manual = true;
      } else {
        this.manual = false;
      }
    });
  }

}

interface Mediciones{
  sensor: number;
  time: number;
}
