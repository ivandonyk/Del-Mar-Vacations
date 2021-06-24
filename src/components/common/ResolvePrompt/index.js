import React, { Component } from 'react';
import RadioInput from '../RadioInput';
import {
    resolveOneIssue,
    archiveOneIssue,
} from '../../../actions';
import { connect } from 'react-redux';

class ResolvePrompt extends Component {
    constructor(props) {
        super(props);
        this.state = {
            resolveType: 'archive'
        };
    }

    onResolveRadioClick = resolveType => {
        this.setState({
            resolveType
        });
    }

    resolveIssue = () => {
        const { resolveType } = this.state;
        const { issueId, resolveOneIssue, archiveOneIssue, callback } = this.props;

        if (resolveType === 'archive') {
            archiveOneIssue(issueId);
        } else {
            resolveOneIssue(issueId, resolveType);
        }

        callback(resolveType);
    }

    render() {  
        let { resolveType } = this.state;
        return (
            <div className="resolve-prompt">
                <div className="resolve-options">
                <RadioInput 
                    onClick={() => this.onResolveRadioClick('archive')} 
                    checked={resolveType === 'archive'} 
                    label="Archive" 
                />
                <RadioInput 
                    onClick={() => this.onResolveRadioClick('invoice')} 
                    checked={resolveType === 'invoice'} 
                    label="Invoice" 
                />
                <RadioInput 
                    onClick={() => this.onResolveRadioClick('notify')} 
                    checked={resolveType === 'notify'} 
                    label="Notify Only" 
                />
                </div>
                <div className="resolve-footer">
                <button onClick={this.props.onCancel} className="orange-txt">Cancel</button>
                <button onClick={this.resolveIssue} className="orange-button">Resolve Issue</button>
                </div>
            </div>
        );
    }
}

export default connect(null, {
    resolveOneIssue,
    archiveOneIssue,
})(ResolvePrompt);