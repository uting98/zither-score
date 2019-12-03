import React, { Component } from 'react';
import { graphqlOperation, API } from 'aws-amplify';
import MaterialTable from "material-table";
import Container from "@material-ui/core/Container";
import * as queries from '../../graphql/queries';
import * as mutations from '../../graphql/mutations';
import * as subscriptions from '../../graphql/subscriptions';

class Dashboard extends Component {
    constructor(props) {
        super(props);
    
        this.state = {
          columns: [
            { title: "Username", field: "username" },
            { title: "Email", field: "email" }
          ]
        };
      }
    
      //get public scores from all users
      async componentDidMount() {
        const limit = 100;
        const result = await API.graphql(
          graphqlOperation(queries.listUsers, {
            limit,
            filter: {
              group: {
                eq: "User"
              }
            }
          })
        );
        console.log(result);
        this.setState({
          users: result.data.listUsers.items
        });
        this.setState({
          data: this.state.users.map(user => {
            const username = user.username;
            const email = user.email;
            return { username: username, email: email };
          })
        });
      }

      async handleDeleteUser(user_id) {
        const deletedUser = await API.graphql(graphqlOperation(mutations.deleteUser,{
            input:{
                id : user_id
            }
        }));
        let params = {
          UserPoolId: process.env.REACT_APP_USERPOOLID,
          Username: user_id
        };
        
      }
    
      render() {
        return (
          <Container maxWidth="md">
            <br />
            <MaterialTable
              title="Users"
              columns={this.state.columns}
              data={this.state.data}
              editable={{
                onRowDelete: oldData =>
                  new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                      this.setState(prevState => {
                        const data = [...prevState.data];
                        data.splice(data.indexOf(oldData), 1);
                        return { ...prevState, data };
                      });
                      this.handleDeleteUser(oldData.username);
                    }, 600);
                  }),
              }}
            />
          </Container>
        );
      }
    }

export default Dashboard;