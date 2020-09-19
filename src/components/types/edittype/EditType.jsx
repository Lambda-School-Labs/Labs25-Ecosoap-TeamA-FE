// DEPENDENCY IMPORTS
import React from 'react';
import { inspect } from 'util';
// GRAPHQL IMPORTS
import gql from 'graphql-tag';
import { client } from '../../../index.js';
// STYLING IMPORTS
import { Form, Input, Button, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import TypeFieldsCard from '../../fields/TypeFieldsCard.js';

const EditTypeForm = props => {
  const {
    handleOk,
    type,
    setTypes,
    types,
    tableState,
    setTableState,
    recordsState,
    setRecordsState,
  } = props;
  async function onFinish(values) {
    // console.log(type.fields);
    console.log('VALUES.FIELDS: ', values.fields);
    let fixedFields = type.fields.map(field => {
      delete field.__typename;
      return field;
    });
    let fieldsValues = values.fields
      ? inspect(values.fields)
          .split("'")
          .join('"')
      : '[]';
    // let allFields = values.fields.length ? [...fixedFields, ...values.fields] : [...fixedFields];
    let typeFields = values.fields
      ? type.fields || values.fields
        ? inspect([...fixedFields, ...values.fields])
            .split("'")
            .join('"')
        : '[]'
      : type.fields || values.fields
      ? inspect([...fixedFields])
          .split("'")
          .join('"')
      : '[]';
    // let testFields = recordsState.map(record => {

    // })
    console.log('All fields', typeFields);
    console.log('records', recordsState);
    // console.log(fields);
    // console.log(fieldsValues);
    let UPD_TYPE_MUTATION = gql`
        mutation {
            updateType(input: {id: "${type.id}" name: "${values.name}", icon: "${values.icon}", fields: ${typeFields}}){
            type{
                id,
                name,
                icon,
                fields{
                name,
                value
                }
            }
            }
        }
    `;

    await client
      .mutate({ mutation: UPD_TYPE_MUTATION })
      .then(res => {
        // console.log('Update response', res);
        setTypes(
          types.map(type =>
            type.id === res.data.updateType.type.id
              ? res.data.updateType.type
              : type
          )
        );
        console.log('RECORD STATE: ', recordsState);
        values.fields &&
          recordsState.data.recordsByType.map(async record => {
            // console.log('Beginning Record Mutation');
            let fixedRecordFields = await record.fields.map(field => {
              // console.log('Field:', field);
              delete field.id;
              delete field.__typename;
              return field;
            });
            let UPD_RECORD_MUT = gql`
          mutation {
            updateRecord(
              input: {
                id: "${record.id}"
                name: "${record.name}"
                coordinates: { latitude: ${
                  record.coordinates.latitude
                }, longitude: ${record.coordinates.longitude} }
                fields: ${
                  record.fields
                    ? inspect([...fixedRecordFields, ...values.fields])
                        .split("'")
                        .join('"')
                    : '[]'
                }
              }
            ) {
              record {
                id
                name
                coordinates {
                  latitude
                  longitude
                }
                fields {
                  id
                  name
                  value
                }
              }
            }
          }
        `;
            console.log('RECORD MUTATION CREATED ' + record.name);
            console.log('I AM HAPPENING' + record.name);
            await client
              .mutate({ mutation: UPD_RECORD_MUT })
              // .then(res => {
              // console.log('UPDATE RECORD RESPONSE: ', res);
              //   let response = res.data;
              // })
              .catch(err => {
                console.log('ERROR: ', err);
              });

            setTimeout(() => {
              console.log('WAITING 1 SECOND');
            }, 10000);

            // let RECORDS_QUERY = gql`
            //   {
            //     recordsByType(input: { typeId: "${type.id}" }) {
            //       id
            //       name
            //       type {
            //         id
            //         name
            //   fields {
            //     id
            //     name
            //     value
            //           }
            //       }
            //       coordinates {
            //         latitude
            //         longitude
            //       }
            //       fields {
            //         id
            //         name
            //         value
            //       }
            //     }
            //   }
            // `;
            // console.log('RECORDS QUERY', RECORDS_QUERY);
            // await client
            //   .query({ query: RECORDS_QUERY })
            //   .then(res => {
            //     // console.log(res);
            //     // setRecordsState(res);
            //     // setTableState(!tableState);
            //   })
            //   .catch(err => {
            //     console.log('ERROR', err);
            //   });
          });
        setTableState(!tableState);
      })
      .catch(err => {
        console.log('CREATE_ERROR', err);
      });
    handleOk();
  }
  return (
    <div>
      {type.name && (
        <Form
          size="medium"
          name="addrecordform"
          layout="vertical"
          onFinish={onFinish}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item label="Name" className="label">
            <Form.Item
              name="name"
              noStyle
              initialValue={type.name}
              rules={[{ required: true, message: 'Name for type is required' }]}
            >
              <Input style={{ width: 350 }} placeholder="Name" />
            </Form.Item>
          </Form.Item>
          <Form.Item label="Icon" className="label">
            <Form.Item
              name="icon"
              noStyle
              initialValue={type.icon}
              rules={[{ required: true, message: 'Icon for type is required' }]}
            >
              <Input style={{ width: 350 }} placeholder="Icon Url" />
            </Form.Item>
          </Form.Item>
          {type.fields &&
            type.fields.map(field => {
              return (
                <TypeFieldsCard
                  key={Math.random()}
                  field={field}
                  type={type}
                  recordsState={recordsState}
                  setRecordsState={setRecordsState}
                />
              );
            })}
          <Form.List name="fields">
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map(field => (
                    <Space key={field.key} align="start">
                      <Form.Item
                        {...field}
                        name={[field.name, 'name']}
                        fieldKey={[field.fieldKey, 'name']}
                        rules={[
                          { required: true, message: 'Field Name missing' },
                        ]}
                      >
                        <Input placeholder="Name" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        fieldKey={[field.fieldKey, 'value']}
                        rules={[
                          { required: true, message: 'Field Value missing' },
                        ]}
                      >
                        <Input placeholder="Value" />
                      </Form.Item>
                      <MinusCircleOutlined
                        onClick={() => {
                          remove(field.name);
                        }}
                      />
                    </Space>
                  ))}
                  <Button
                    className="dashedbtn"
                    width="350"
                    type="dashed"
                    block
                    onClick={() => {
                      add();
                    }}
                  >
                    <PlusOutlined /> Add Fields
                  </Button>
                </div>
              );
            }}
          </Form.List>
          <Button
            width="100%"
            size="large"
            type="primary"
            block
            htmlType="submit"
          >
            Save
          </Button>
        </Form>
      )}
    </div>
  );
};

export default EditTypeForm;
