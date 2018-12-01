import React, { Component } from 'react';
import { AuthenticationContext } from '../core/api/authentication';

import Button from '@material-ui/core/Button';
import Calendar from '../components/Calendar';

class Index extends Component {

    static contextType = AuthenticationContext;

    signOut = (e) => {
        this.context.signOut();
    }

    render() {
        return(
            <div style={{ width:"100%" }}>
                <Calendar />
                <Button variant="contained" onClick={this.signOut}>Sign Out</Button>
            </div>
        );
    }
}

export default Index;