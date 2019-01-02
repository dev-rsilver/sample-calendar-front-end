import React, {Component} from 'react';
import produce from 'immer';

import { ApiClient } from '../core/api/api.js';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { withStyles } from '@material-ui/core';
import { AuthenticationContext } from '../core/api/authentication.js';


const styles = { 
    title: {
      marginBottom:15  
    },
    card: {
        textAlign: "left",
        maxWidth: 500,
        width:"95%",
        paddingTop: 20,
        paddingBottom: 20
    },
    cardContentContainer: {
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: "90%"
    },
    inputs: {
        width: "100%",
        maxWidth: 400,
        marginBottom: 20
    },
    signInButton: {
        float: "right"
    },
    errorContainer: {
        display: "inline-block",
        verticalAlign: "top"
    },
    errorText: {
        fontSize: "0.8rem",
        marginLeft: 23,
        marginTop: 10
    },
    note: {
        fontSize: "0.8rem",
        marginTop: 20
    }

};

class signInCard extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: "",
            errors: {
                message: "",
                username: { 
                    error: ""
                },
                password: {
                    error: ""
                }
            }
        }

        this.fieldReferences = {
            password: React.createRef()
        }

    }

    static contextType = AuthenticationContext;
 
    signIn = (e) => {

        var errors = 0;
        errors += this.requireField("Username");
        errors += this.requireField("Password");

        if(errors > 0) {
            return;
        }

        var user = this.state.username;
        var password = this.fieldReferences["password"].current.value;

        var api = new ApiClient();
        api.signin(user, password, (result) => {

            //Set the token in the main app that'll be used for future API calls.
            this.context.setToken(result);

        }, (status) => {

            var errorMessage = "";

            switch(status) {
                case "NetworkError": 
                    errorMessage = "An error occurred. Please wait and try again.";
                    break;
                default: 
                    errorMessage = "Username or password is incorrect.";
            }

            this.setState((state) => produce(state, draft => {
                draft.errors.message = errorMessage;
            }));
        });
    }

    /**
     * 
     * Returns (number) 1 if error, 0 if no error. Returned number can be used to aggregate errors.
     * 
     * Example usage:
     * var errors = 0;
     * errors += this.requireField("input1");
     * errors += this.requireField("input2");
     * if(errors > 0) { return; }
     * 
     * @param {*} id The name of a root-level variable in state (or fieldReferences) that also has a corresponding entry in the form of [id]: { error: "" } in the state "errors" object.
     */
    requireField(id) {
        
        id = id.toLowerCase();

        //Field will either be in state or references.
        var field = undefined;

        if(this.fieldReferences[id] !== undefined) {
            field = this.fieldReferences[id].current.value;
        } else {
            field = this.state[id];
        }

        if(field === undefined || field.trim().length <= 0) {
            this.setState((state) => produce(state, draft => {
                draft.errors[id].error = "Required";
            }));
            return 1;
        } else {
            this.setState((state) => produce(state, draft => {
                draft.errors[id].error = "";
            }));
            return 0;
        }
    }

    onChange = (e) => {
        var id = e.target.id.toLowerCase();
        var value = e.target.value;
        this.setState((state) => produce(state, draft => {
            draft[id] = value;
        }));
    }

    render() {
        return(
        <React.Fragment>
        <Card className={this.props.classes.card}>
            <CardContent>
                <div className={this.props.classes.cardContentContainer}>
                    <Typography variant="h4" className={this.props.classes.title}>Sign In</Typography>
                    <div>
                        <TextField id="Username" 
                                   label="Username" 
                                   className={this.props.classes.inputs} 
                                   error={this.state.errors.username.error.length > 0 } 
                                   helperText={this.state.errors.username.error}
                                   value={this.state.user}
                                   onChange={this.onChange}></TextField>
                    </div>
                    <div>
                        <TextField id="Password" 
                                   label="Password" 
                                   type="password" 
                                   className={this.props.classes.inputs} 
                                   error={this.state.errors.password.error.length > 0 } 
                                   helperText={this.state.errors.password.error}
                                   inputRef={this.fieldReferences["password"]}
                                   ></TextField>
                    </div>
                    <div style={{ maxWidth: (styles.inputs.minWidth + 10).toString() + 'px' }}>
                        <Button className={this.props.classes.signInButton} onClick={this.signIn} variant="contained" color="primary">Sign In</Button>
                    </div>
                </div>
                <div className={this.props.classes.errorContainer}>
                    <Typography color="error" className={this.props.classes.errorText}>{this.state.errors.message}</Typography>
                </div>
            </CardContent>
        </Card>
        <Typography className={this.props.classes.note}>
                This application is a demonstration, not for actual use.
        </Typography>
        
        </React.Fragment>);

    }
}

const SignInCard = withStyles(styles)(signInCard);

class UnauthorizedView extends Component
{
    static contextType = AuthenticationContext;

    render() {
        return <SignInCard {...this.props} />;
    }
    
}

export { UnauthorizedView }
