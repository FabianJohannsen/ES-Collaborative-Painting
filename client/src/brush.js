import ColorPicker from 'simple-color-picker';
import 'simple-color-picker/src/simple-color-picker.css';

export default class Brush {
    constructor() {
        this.colorPickerEl = document.getElementById('color-picker');
        this.lineWidthSlider = document.getElementById('line-width');

        this.colorPicker = new ColorPicker({
            color: '#ff0000',
            background: '#454545',
            el: this.colorPickerEl,
            width: 200,
            height: 200,
        });
    }

    get color() {
        return this.colorPicker.getHexString();
    }

    get lineWidth() {
        return this.lineWidthSlider.value;
    }
}
