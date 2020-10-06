import React, { Component } from 'react'; // importing FunctionComponent


type Props = {
    label: string,
    type: string,
    placeholder: string,
    id: string,
    value: any
    onChange: any
}

type InputState = {
    name: string,
    value: string
}





export class TextFieldc extends Component<Props, InputState> {

    _handleChange = (event: any) => {
        this.props.onChange(event.target.value);
      }
    

    render() {
        const { label,type,placeholder,value,id} = this.props;
        return (
        <div className="formGroup">
            <label htmlFor={this.props.id}>{this.props.label}</label>
            <input type={type} className="form-control" value={value} onChange={this._handleChange} id={id} placeholder={placeholder} />
        </div>

        );

    }

}



//
