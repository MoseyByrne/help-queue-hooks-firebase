import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components"

const StyledWrapper = styled.section`
  background-color: orange;
`;

const HelpQueueHeader = styled.h1`
  font-size: 24px;
  text-align: center;
  color: white;
  background-color: purple;
`;

function Header() {
  return (
    // <React.Fragment> don't need this anymore because our code is wrapped in new stylized component
    <StyledWrapper>
      <HelpQueueHeader>Help Queue</HelpQueueHeader>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/sign-in">Sign In</Link>
        </li>
      </ul>
      </StyledWrapper>
      // </React.Fragment>
  );
}

export default Header;