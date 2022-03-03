import React from "react";
import ReactDOM from "react-dom";

interface ModalProps extends React.HTMLAttributes<HTMLElement> {
  visible: boolean;
}

const Modal = (props: ModalProps) => {
  const element = window.document.querySelector("#portal");
  const componentJSX = props.visible ? (
    <React.StrictMode>
      <div
        className="w-full h-full fixed top-0 left-0 bg-gray-800 bg-opacity-5 backdrop-blur-sm backdrop-brightness-50"
      >
        {props.children}
      </div>
    </React.StrictMode>
  ) : null;
  if (element) {
    return ReactDOM.createPortal(componentJSX, element);
  } else {
    throw Error("the element with #portal no found.")
  }
};

export default Modal;
