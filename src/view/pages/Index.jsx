import React, { Component } from 'react'

import {View,page} from 'gfs-react-dm'
import { message, Modal, Button } from 'antd'

import 'antd/dist/antd.less'
import '../style/common.less'
import '../style/index.less'

message.config({
    top: 100,
    duration:3,
    maxCount: 1
});
export default class Index extends Component{
    constructor(props){
        super(props)
        this.state = {
            count:0,
            visible:false
        }
    }
    componentDidMount(){
        this.no = document.querySelector('.no')
        this.yes = document.querySelector('.yes')

    }
    closeHandle(){
        this.setState({
            visible:true
        })
    }

    noOverHandle(){
        const { count } = this.state
        this.setState({
            count:this.state.count + 1
        })
        let bottom = this.no.style.bottom
        if(count >= 2){
            if(this.no.style.right != '100px'){
                this.no.style.right = '100px'
                this.yes.style.right = '45px'
            }else{
                this.no.style.right = '45px'
                this.yes.style.right = '100px'
            }
           
        }else{
            if(!bottom){
                this.no.style.bottom = '80px'
            }else{
                this.no.style.bottom = ''
            }
        }
        if(count > 6){
            message.warning('不要挣扎了好不好')
        }
        console.log(this.state.count)
    }

    noClickHandle(){
        message.warning('放弃吧，能不能诚实点，你的良心不会痛吗')
    }
    yesClickHandle(){
        message.success('我也是')
    }

    handleOk(){
        this.setState({
            visible:false
        })
    }
    render(){
        const { visible } = this.state
        return (
            <div className="container">
                <div className="close"><span className="x" onClick={this.closeHandle.bind(this)}></span></div>
                <div className="content font-18 col-666">你是不是喜欢我？</div>
                <div className="choose">
                    <button className="yes" onClick={this.yesClickHandle.bind(this)}>是的</button>
                    <button className="no" onClick={this.noClickHandle.bind(this)} onMouseOver={this.noOverHandle.bind(this)}>不是</button>
                </div>
                <Modal
                    visible={visible}
                    title="Title"
                    closable={false}
                    footer={[
                        <Button  type="primary"  onClick={this.handleOk.bind(this)}>
                        确定
                        </Button>,
                    ]}
                    >
                    <p>关闭也不能改变事实</p>
                </Modal>
            </div>
        )
    }
}

page(Index).render()