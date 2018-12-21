import React, { Component } from 'react';

import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';


const styles = theme => ({
});

class deleteDialogContent extends Component {

    constructor(props) {
        super(props);

        if(this.props.title === undefined) {
            throw new Error("'title' prop must be defined.");
        }

        if(this.props.onDelete !== undefined && typeof this.props.onDelete !== "function") {
            throw new Error("onDelete must be a function.");
        }
    }

    deleteEvent = () => {
        if(this.props.onDelete !== undefined) {
            this.props.onDelete(this.props.id);
        }
    }

    render() {
        return(
            <div>
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent>
                    {this.props.text}
                </DialogContent>
                <DialogActions>
                        <Button color="secondary" variant="contained" onClick={this.deleteEvent}>Delete</Button>
                        <Button color="primary" onClick={this.props.close}>Cancel</Button>
                </DialogActions>
            </div>
        )
    }

}


const StyledDeleteDialogContent = withStyles(styles)(deleteDialogContent);

/**
 * Component that contains content for a delete dialog.
 * Note that this component must be wrapped in a <Dialog> component.
 * 
 * @param {string} title Property: The title of the dialog
 * @param {string} text Property: The text of the dialog
 * @param {string} id Property: The id of the event
 * @param {function} close Property: Function that enables closing the containing dialog
 * @param {function} onDelete Property: Callback in the form of function(id) that is called when the delete button is clicked
 */
class DeleteDialogContent extends Component {

    render() {
        return <StyledDeleteDialogContent {...this.props} />
    }

}

export default DeleteDialogContent;