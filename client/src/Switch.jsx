import React from "react";
import styled from "styled-components";

const Switch = ({ on, onSwitch }) => {
  return (
    <Style>
      <button onClick={onSwitch} className={on ? "on" : "off"}>
        <span />
      </button>
    </Style>
  );
};

const Style = styled.div`
  button {
    width: 70px;
    height: 35px;
    position: relative;
    background: #eee;
    border-radius: 50px;
    outline: none;
    transition: background 0.4s;
border:0;
    span {
        position: absolute;
        top: 3px;
        left: 3px;
        width: 30px;
        height: 30px;
        background: #fff;
        border-radius: 35px;
        transition: all 0.2s cubic-bezier(0, 0, 0.46, 1.82);
        transition: all 0.2s cubic-bezier(0.24, 1.74, 0.92, 0.85);
    }

    &:active {
      span {
        width: 50px;
      }

      &.on span {
        margin-left: -54px;
      }
    }

    &.on {
      background: #004aad;
      span {
        left: 100%;
        margin-left: -33px;
      }
    }
  }
`;

export default Switch;
