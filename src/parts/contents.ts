
import { Conf } from "../core/conf";
import { MyDisplay } from "../core/myDisplay";
import { Param } from "../core/param";
import { Util } from "../libs/util";
import { Color } from "three/src/math/Color";
import { Tween } from "../core/tween";

// -----------------------------------------
//
// -----------------------------------------
export class Contents extends MyDisplay {

  private _item:Array<{el:HTMLElement, color:string, order:number}> = [];
  private _posTable:Array<any> = [];
  private _col:number = 32;


  constructor(opt:any) {
    super(opt)

    // 画像解析
    const img:HTMLImageElement = new Image();
    img.onload = () => {
      const cvs:any = document.createElement('canvas');
      cvs.width = img.width;
      cvs.height = img.height;

      const ctx = cvs.getContext('2d');
      ctx.drawImage(img, 0, 0);
      img.style.display = 'none';

      const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const key = ~~(i / 4)
        const ix = ~~(key % cvs.width)
        const iy = ~~(key / cvs.height)

        let r = data[i + 0] // 0 ~ 255
        let g = data[i + 1] // 0 ~ 255
        let b = data[i + 2] // 0 ~ 255
        const a = data[i + 3] // 0 ~ 255

        let col:Color = new Color(r/255, g/255, b/255);
        if(a <= 0) col = new Color(0x06F69D);

        // 真ん中からの距離
        const dx = (this._col * 0.5) - ix;
        const dy = (this._col * 0.5) - iy;
        const d = Math.sqrt(dx * dx + dy * dy);

        this._posTable.push({
          color:col.getStyle(),
          d:d,
          a:a,
        })
      }

      const text = Array.from('こんど、デートしよう。');
      let innerTxt = '';
      this._posTable.forEach((val,i) => {
        let t = text[i % text.length];
        const i2 = ~~(i / text.length);
        if(i2 % 2 != 0) t = '　';
        innerTxt += '<span data-color="' + val.color + '" data-order="' + val.d + '" data-alpha="' + (val.a <= 0 ? 0 : 1) + '">' + t + '</span>';
        if((i + 1) % this._col == 0) {
          innerTxt += '<br>';
        }
      });
      (document.querySelector('.l-text > .inner') as HTMLElement).innerHTML = innerTxt;

      document.querySelectorAll('.l-text span').forEach((val) => {
        const col = val.getAttribute('data-color') as string

        this._item.push({
          el:val as HTMLElement,
          color:col,
          order:Number(val.getAttribute('data-order'))
        });

        if((Number(val.getAttribute('data-alpha')) <= 0)) {
          val.classList.add('-hide');
        }
      })

      Util.instance.shuffle(this._item);
      // 並び替え
      // Util.instance.sort(this._item, 'order', false);
    }
    img.src = Conf.instance.PATH_IMG + 'sample-' + this._col + '.png';
  }


  protected _update(): void {
    super._update();

    const zoomer = document.body.clientWidth / window.innerWidth;
    Param.instance.zoom = zoomer;

    const rate = Util.instance.map(zoomer, 0, 1, 1, 2.5);

    const len = this._item.length;
    this._item.forEach((val,i) => {
      const isFix = (1 / len) * i < rate;
      if(!isFix) {
        // ハートみえる
        Tween.instance.set(val.el, {
          backgroundColor:val.color,
          color:val.color
        })
      } else {
        // テキスト見える
        Tween.instance.set(val.el, {
          backgroundColor:'',
          color:'#E96975'
        })
      }
    })
  }
}