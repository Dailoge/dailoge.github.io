import React,{ Component } from 'react'
import {View,page} from 'gfs-react-dm'


import '../assert/common.less'
import '../assert/test.less'

export default class Test extends Component{

    constructor(props){
        super(props)
        this.state = {

        }
    }

    render(){
        return (
            <div className="container">
                <div className="test">
                    123
                </div>
            </div>
        )
    }
}

page(Test).render()