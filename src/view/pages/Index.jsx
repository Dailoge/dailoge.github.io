import React, { Component } from 'react'

import {View,page} from 'gfs-react-dm'

import '../style/common.less'
import '../style/index.less'

export default class Index extends Component{
    constructor(props){
        super(props)
        this.state = {

        }
    }
    closeHandle(){
        console.log(122)
    }

    render(){
        return (
            <div className="container">
                <div className="close"><span className="x" onClick={this.closeHandle.bind(this)}></span></div>
                <div className="content font-18 col-666">你是不是喜欢我？</div>
                <div className="choose">
                    <button className="yes">是的</button>
                    <button className="no">不是</button>
                </div>
            </div>
        )
    }
}

page(Index).render()