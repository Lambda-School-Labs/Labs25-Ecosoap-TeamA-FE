import React, { useState } from 'react';
import { Button, Popover } from 'antd';

const TypeButton = (props) => {
  const { type, emstate, setEMState, dmstate, setDMState, setTypeId, setTypeName, setMapState } = props;

  // EDIT MODAL => STATE AND SHOW BUTTON FUNCTION
  function showEMButton() {
    setEMState({
      ...emstate,
      visible: !emstate.visible,
    });
  }
  // DELETE MODAL => STATE AND SHOW BUTTON FUNCTIONALITY
  function showDMButton() {
    setDMState({
      ...dmstate,
      visible: !dmstate.visible,
    });
  }

  const content = (
    <div>
      <p
        className="popoverp"
        onClick={async () => {
          await setTypeId(type.id);
          await setTypeName(type.name);
          await setMapState(false);
          showEMButton();
        }}
      >
        Edit
          </p>
      <p
        className="popoverp"
        style={{ color: 'red' }}
        onClick={async () => {
          await setTypeId(type.id);
          await setTypeName(type.name);
          await setMapState(false);
          showDMButton();
        }}
      >
        Delete
          </p>
    </div>
  );

  return (
    <Popover
      key={type.name}
      placement="rightBottom"
      title="Options"
      content={content}
      trigger="hover"
    >
      <Button
        key={type.id}
        onClick={() => {
          setTypeName(type.name);
          setTypeId(type.id);
          setMapState(false);
        }}
      >
        {type.name}
      </Button>
    </Popover>
  )
}

export default TypeButton;