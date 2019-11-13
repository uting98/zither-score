import React, {Component} from "react";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import RemoveIcon from "@material-ui/icons/Remove";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import Grid from "@material-ui/core/Grid";
import { Nav, Navbar, NavDropdown } from "react-bootstrap";
import "../style.css";

class ToolBar extends Component {
  render() {
    return (
      <div className="toolBarbackground">
        <Grid container justify="center">
          <Navbar expand="lg">
            <NavDropdown title={<FiberManualRecordIcon fontSize="small" />} id="basic-nav-dropdown">
              <NavDropdown.Item>Top</NavDropdown.Item>
              <NavDropdown.Item>Buttom</NavDropdown.Item>
            </NavDropdown>
            <Nav>{<RemoveIcon />}</Nav>
            <Nav>{<DragHandleIcon />}</Nav>
          </Navbar>
        </Grid>
    </div>
    )
  }
}

export default ToolBar;
