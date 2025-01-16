
import  React, { useState } from "react";
import { ActionSheet,Cell } from '@nutui/nutui-react';
import "./index.css";

const SelectTokens = (props) => {
//   const [isVisible6, setIsVisible6] = useState(false)
//   setIsVisible6(props.visible)
  const optionsFour= [
    {
      title: 'BT2N',
      id: 1,
    },
    {
      title: 'BTC',
      id:2,
    },
  ]
  const optionKey = {
    name: 'title',
  }
  return (   
      <ActionSheet 
      className="actionSheet"
         style={{fontSize:'40px'}}
        visible={props.visible}
        optionKey={optionKey}
        options={optionsFour}
        title="选择币种"
        danger="red"
        cancelText="取消"
        onSelect={(data) => {
            props.onchange(data)
        }}
        onCancel={() => {
            props.onClose()
            // setIsVisible6(false)}
        }}
      />
  );
};  
export default SelectTokens;

