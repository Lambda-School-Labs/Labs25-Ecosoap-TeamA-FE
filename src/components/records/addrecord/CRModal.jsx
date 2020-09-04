// DEPENDENCY IMPORTS
import React from "react";
// COMPONENT IMPORTS
import AddRecordForm from "./AddRecord.jsx";
// STYLING IMPORTS
import { Modal } from 'antd';

function CRModal(props){
    const handleOk = () => {
        props.setState({ ...props.state, loading: !props.state.loading })
        setTimeout(() => {
            props.setState({ ...props.state, loading: !props.state.loading, visible: !props.state.visible })
        }, 500)
    }
    const handleCancel = () => {
        props.setState({ ...props.state, visible: false })
    }
        return (
            <div className="modal">
                <Modal
                    width="400px"
                    style={{ display: "flex", flexDirection: 'column'}}
                    visible={props.state.visible}
                    title="Add Record"
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <AddRecordForm
                        handleOk={handleOk}
                        loading={props.state.loading}
                        visible={props.state.visible}
                        type={props.titleText}
                        types={props.types}
                        typeId={props.type}
                        setRecordsState={props.setRecordsState}
                        recordsState={props.recordsState}
                    />
                </Modal>
            </div>
        );
    }


export default CRModal;