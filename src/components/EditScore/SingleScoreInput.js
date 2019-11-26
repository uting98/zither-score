import React, { Component } from "react";
import "../../stylesheets/style.css";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import AddIcon from "@material-ui/icons/Add";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import Dot from "@material-ui/icons/FiberManualRecord";
import Line from "@material-ui/icons/Remove";
import DoubleLine from "@material-ui/icons/DragHandle";
import { Dropdown } from "react-bootstrap";
import { graphqlOperation, API } from 'aws-amplify';
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import * as subscriptions from '../../graphql/subscriptions';

// Four inputs in one componenet
class SingleScoreInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notes: [],
      num: null,
      pos: [],
      line: false,
      doubleline: false
    };
    console.log(this.props.score);
    this.handleChange = this.handleChange.bind(this);
    this.handleCreateNote = this.handleCreateNote.bind(this);
    this.handleUpdateNote = this.handleUpdateNote.bind(this);
    this.handleDeleteNote = this.handleDeleteNote.bind(this);
    this.handleShowLine = this.handleShowLine.bind(this);
    this.handleLineClick = this.handleLineClick.bind(this);
    //this.handleDotClick = this.handleDotClick.bind(this)
    this.handleShowDoubleLine = this.handleShowDoubleLine.bind(this);
    this.handleShowSymbols = this.handleShowSymbols.bind(this);
    //this.handleShowDot = this.handleShowDot.bind(this)

    this.noteCreationSubscription = null;
    this.noteUpdationSubscription = null;
    this.noteDeletionSubscription = null;
  }

  async componentDidMount() {
    const result = await API.graphql(graphqlOperation(queries.listNotes, { 
      limit: 200, 
      filter: {
        scoreId: {
          eq: this.props.score.id
        }
      }}));  

    this.setState({
      notes: result.data.listNotes.items
    });

    console.log("notes", this.state.notes);

    this.noteCreationSubscription = API.graphql(graphqlOperation(subscriptions.onCreateNote)).subscribe({
      next: (noteData) => {
        const createdNote = noteData.value.data.onCreateNote;
        const updatedNotes = [...this.state.notes, createdNote];
        this.setState({
          notes: updatedNotes
        })
      }
    })

    this.noteDeletionSubscription = API.graphql(graphqlOperation(subscriptions.onDeleteNote)).subscribe({
      next: (noteData) => {
          const deletedNote = noteData.value.data.onDeleteNote.id;
          console.log("deleted note id: " + deletedNote);

          const remainingNotes = this.state.notes.filter(notesData => notesData.id !== deletedNote);
          this.setState({
              note: remainingNotes
          });
      },
    });

    this.noteUpdationSubscription = API.graphql(graphqlOperation(subscriptions.onUpdateNote)).subscribe({
      next: (noteData) => {
          const updatedNote = noteData.value.data.onUpdateNote;
          const updatedNotes = this.state.notes.filter(notesData => notesData.id !== updatedNote.id);
          this.setState({
              notes: [...updatedNotes, updatedNote]
          });
      },
    });

    console.log(this.state.notes);
  }

  componentWillUnmount() {
    if(this.noteCreationSubscription) this.noteCreationSubscription.unsubscribe();
    if(this.noteUpdationSubscription) this.noteUpdationSubscription.unsubscribe();
    if(this.noteDeletionSubscription) this.noteDeletionSubscription.unsubscribe();  
  }

  async handleChange(e) {
    e.preventDefault();
    try {
      let { value, min, max } = e.target;
      console.log(e.target.value);
      if(value) {
        value = Math.max(Number(min), Math.min(Number(max), Number(value)));
      }
      else value = null;
      let result = e.target.id.replace(/, +/g, ",").split(",").map(Number);
      this.setState({
        num: value,
        pos: result
      }, () => {
        const temp = this.state.notes;
        console.log(temp);
        let exist = false;
        let note_id = "";
        for(let i = 0; i < temp.length; ++i) {
          if(JSON.stringify(temp[i].position) == JSON.stringify(this.state.pos)) {
            /* console.log("temp: ", temp[i].position);
            console.log("pos: ", this.state.pos); */
            note_id = temp[i].id;
            exist = true;
          }
        }
        console.log(exist);
        if(exist) {
          this.state.num ? this.handleUpdateNote(note_id) : this.handleDeleteNote(note_id);
        }
        else {
          this.handleCreateNote();
        }
        
      });
    }
    catch(e) {
      alert(e.message);
    }
  };

  async handleCreateNote() {
    try {
      const noteCreated = await API.graphql(graphqlOperation(mutations.createNote, {
          input: {
            number: this.state.num,
            position: this.state.pos,
            noteScoreId: this.props.score.id,
            scoreId: this.props.score.id
          }
      }));
      this.setState({
        note: noteCreated
      });
      console.log("created: ", noteCreated.data.createNote);
    }
    catch(e) {
      alert(e.message);
    }
  }

  async handleUpdateNote(id) {
    const updatedNote = await API.graphql(graphqlOperation(mutations.updateNote, {
        input: {
          id: id,
          number: this.state.num,
          position: this.state.pos
        }
    }));
    console.log("updated: ", updatedNote.data.updateNote);
  }

  async handleDeleteNote(id) {
    const deletedNote = await API.graphql(graphqlOperation(mutations.deleteNote,{
        input:{
            id : id
        }
    }));
  }

  componentDidUpdate() {
    if(this.state.notes){
      const temp = this.state.notes;

      this.state.notes.forEach((note) => {
        /* console.log("row: ", note.position[0]);
        console.log("linelength: ", this.props.lineLength.length); */
        if(note.position[0] < this.props.lineLength.length) {
          const pos = note.position.toString();
          const input = document.getElementById(pos);
          
          input.value = note.number;

         
        }
      })
    }
  }

  handleLineClick = () => {
    this.setState(prevState => {
      return {
        line: !prevState.line
      };
    }, () => console.log(this.state.line));
  }

  handleDoubleLineClick = () => {
    console.log("inside double");
    this.setState(prevState => {
      return {
        doubleline: !prevState.doubleline
      };
    }, () => console.log(this.state.doubleline));
  }

  /*handleDotClick = () => {
    this.setState(prevState => {
      return {
        Dot: !prevState.Dot
      };
    }, () => console.log(this.state.line));
  } */

  handleShowSymbols() {
    console.log("inside show symbol");
    if(this.state.line) return this.handleShowLine();
    else if(this.state.doubleline) return this.handleShowDoubleLine();
    
  }

  handleShowLine() {
    return (
      <div>
        <p>▁▁▁</p>
      </div>
    );
  }

  handleShowDoubleLine() {
    return (
      
        <div>
          <p>▁▁▁</p>
          <p>▁▁▁</p>
        </div>
      
    );
  }

 /*handleShowDot() {
    return (
      <div>
        <Dot fontSize="small" />
      </div>
    )
  }*/

  //console.log(props.nodeLength);
  render() {
    return this.props.lineLength.map(row => (
      <Container className="lineSpacing" key={row} maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Grid container justify="center" spacing={2}>
              <span className="lineBegin">|</span>
              <Grid class="displayinrow" item>
                {this.props.nodeLength.map(column => (
                  <span key={column} className="displayinrow">
                    <span className="displayincolumn">
                      <span className="dropdown d-inline col-xs-12">
                        <Dropdown className="d-inline" key="0">
                          <Dropdown.Toggle className="btn btn-sm btn-light">
                            <AddIcon fontSize="small" color="action" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <Dot /*onClick={this.handleDotClick}*/ fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Line onClick={this.handleLineClick} fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <DoubleLine onClick={this.handleDoubleLineClick} fontSize="small" />
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </span>
                      <span key={column}>
                        <input
                          key="0"
                          className="singleNote"
                          type="number"
                          min="0"
                          max="7"
                          line={this.state.line}
                          doubleline={this.state.doubleline}
                          id={[row, column, 0]}
                          onChange={this.handleChange}
                        />
                        <div>{this.handleShowSymbols()} </div>
                         
                      </span>
                    </span>
                    <span className="displayincolumn">
                      <span className="dropdown d-inline col-xs-12">
                        <Dropdown className="d-inline" key="1">
                          <Dropdown.Toggle className="btn btn-sm btn-light">
                            <AddIcon fontSize="small" color="action" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <Dot fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Line onClick={this.handleLineClick} fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <DoubleLine onClick={this.handleDoubleLineClick} fontSize="small" />
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </span>
                      <span key={column}>
                        <input
                          key="1"
                          className="singleNote"
                          type="number"
                          min="0"
                          max="7"
                          id={[row, column, 1]}
                          onChange={this.handleChange}
                        />
                        {this.handleShowSymbols()}
                      </span>
                    </span>
                    <span className="displayincolumn">
                      <span className="dropdown d-inline col-xs-12">
                        <Dropdown className="d-inline" key="2">
                          <Dropdown.Toggle className="btn btn-sm btn-light">
                            <AddIcon fontSize="small" color="action" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                          <Dropdown.Item>
                              <Line onClick={this.handleLineClick} fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <DoubleLine onClick={this.handleDoubleLineClick} fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <DoubleLine fontSize="small" />
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </span>
                      <span key={column}>
                        <input
                          key="2"
                          className="singleNote"
                          type="number"
                          min="0"
                          max="7"
                          id={[row, column, 2]}
                          onChange={this.handleChange}
                        />
                        {this.handleShowSymbols()}
                      </span>
                    </span>
                    <span className="displayincolumn">
                      <span className="dropdown d-inline col-xs-12">
                        <Dropdown className="d-inline" key="3">
                          <Dropdown.Toggle className="btn btn-sm btn-light">
                            <AddIcon fontSize="small" color="action" />
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item>
                              <Dot fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <Line onClick={this.handleLineClick} fontSize="small" />
                            </Dropdown.Item>
                            <Dropdown.Item>
                              <DoubleLine onClick={this.handleDoubleLineClick} fontSize="small" />
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </span>
                      <span key={column}>
                        <input
                          key="0"
                          className="singleNote"
                          type="number"
                          min="0"
                          max="7"
                          id={[row, column, 3]}
                          onChange={this.handleChange}
                        />
                        {this.handleShowSymbols()}
                      </span>
                    </span>


                    <span className="lineInBetween">| </span>
                  </span>

                ))}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    ));
  }
};

export default SingleScoreInput;