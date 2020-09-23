import React, { useState } from 'react';
import { Popover, Form, Input, Button } from 'antd';
import { client } from '../../index';
import gql from 'graphql-tag';
import { inspect } from 'util';
import { FETCH_TYPES } from '../../graphql/queries';

function TypeFieldsCard(props) {
  async function onFinish(values) {
    let updatedFields = inspect(
      props.type.fields.map(field => {
        delete field.__typename;
        delete field.id;
        return field.name === props.field.name
          ? { name: values.name, value: values.value }
          : field;
      })
    )
      .split("'")
      .join('"');

    let UPD_TYPE_MUTATION = gql`
        mutation {
            updateType(input: {id: "${props.type.id}" name: "${props.type.name}", icon: "${props.type.icon}", fields: ${updatedFields}}){
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
      .then(async res => {
        let batchArray = [];
        let counter = 0;

        await props.recordsState.data.recordsByType.map(async record => {
          let fixedRecordFields = await record.fields.map(field => {
            delete field.id;
            delete field.__typename;
            return field;
          });

          let replacedFields =
            props.field &&
            fixedRecordFields.map(field => {
              return field.name === props.field.name
                ? {
                    name: values.name,
                    value: field.value,
                  }
                : field;
            });

          let recordFields = inspect(replacedFields)
            .split("'")
            .join('"');

          let BATCH_QUERY = `mutation${counter}: updateRecord(
            input: {
              id: "${record.id}"
              name: "${record.name}"
              coordinates: { latitude: ${record.coordinates.latitude}, longitude: ${record.coordinates.longitude} }
              fields: ${recordFields}
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
          }`;

          batchArray.push(BATCH_QUERY);
          counter += 1;
        });

        let gqlString = `mutation {${batchArray}}`;
        let batchMutation = gql`
          ${gqlString}
        `;

        await client.mutate({ mutation: batchMutation }).catch(err => {
          console.log('ERROR', err);
        });
      })
      .catch(err => {
        console.log('ERROR', err);
      });

    await client
      .query({ query: FETCH_TYPES })
      .then(res => {
        props.setTypes(res.data.types);
      })
      .catch(err => {
        console.log('ERROR', err);
      });

    let GET_TYPE = gql`
      {
        typeById(input: {typeId: "${props.type.id}"}){
          id
          name
          icon
          fields {
            name
            value
          }
        }
      }
      `;

    await client
      .query({ query: GET_TYPE })
      .then(res => {
        props.setType(res.data.typeById);
      })
      .catch(err => {
        console.log('ERROR', err);
      });

    props.setTableState(!props.tableState);
  }
  async function delField(id) {
    let fixedFields = props.type.fields.map(field => {
      delete field.__typename;
      delete field.id;
      return field;
    });

    let updatedFields = inspect(
      fixedFields.filter(field => {
        return field.name !== props.field.name;
      })
    )
      .split("'")
      .join('"');

    let DELETE_TYPE_FIELD_MUTATION = gql`
        mutation {
            updateType(input: {id: "${props.type.id}" name: "${props.type.name}", icon: "${props.type.icon}", fields: ${updatedFields}}){
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
      .mutate({ mutation: DELETE_TYPE_FIELD_MUTATION })
      .then(async res => {
        let batchArray = [];
        let counter = 0;

        await props.recordsState.data.recordsByType.map(async record => {
          let fixedRecordFields = await record.fields.map(field => {
            delete field.id;
            delete field.__typename;
            return field;
          });

          let replacedFields = inspect(
            fixedRecordFields.filter(field => {
              return field.name !== props.field.name;
            })
          )
            .split("'")
            .join('"');

          let BATCH_QUERY = `mutation${counter}: updateRecord(
            input: {
              id: "${record.id}"
              name: "${record.name}"
              coordinates: { latitude: ${record.coordinates.latitude}, longitude: ${record.coordinates.longitude} }
              fields: ${replacedFields}
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
          }`;

          batchArray.push(BATCH_QUERY);
          counter += 1;
        });

        let gqlString = `mutation {${batchArray}}`;

        let batchMutation = gql`
          ${gqlString}
        `;

        await client.mutate({ mutation: batchMutation }).catch(err => {
          console.log('ERROR', err);
        });
      })
      .catch(err => {
        console.log('ERROR', err);
      });

    await client
      .query({ query: FETCH_TYPES })
      .then(res => {
        props.setTypes(res.data.types);
      })
      .catch(err => {
        console.log('ERROR', err);
      });

    let GET_TYPE = gql`
      {
        typeById(input: {typeId: "${props.type.id}"}){
          id
          name
          icon
          fields {
            name
            value
          }
        }
      }
      `;

    await client
      .query({ query: GET_TYPE })
      .then(res => {
        props.setType(res.data.typeById);
      })
      .catch(err => {
        console.log('ERROR', err);
      });

    props.setTableState(!props.tableState);
  }
  return (
    <div className="fieldsCard">
      <div className="line1">
        <span>Name: {props.field.name}</span>{' '}
        <Popover
          key={props.field.id}
          content={
            <>
              <Form
                size="medium"
                name="editfield"
                layout="vertical"
                onFinish={onFinish}
              >
                <Form.Item label="Name" className="label">
                  <Form.Item
                    name="name"
                    noStyle
                    initialValue={props.field.name}
                    rules={[
                      { required: true, messsage: 'Name for field required' },
                    ]}
                  >
                    <Input style={{ width: 350 }} placeholder="Name" />
                  </Form.Item>
                </Form.Item>
                <Form.Item label="Value" className="label">
                  <Form.Item
                    name="value"
                    noStyle
                    initialValue={props.field.value}
                    rules={[
                      { required: true, messsage: 'Value for field required' },
                    ]}
                  >
                    <Input style={{ width: 350 }} placeholder="Value" />
                  </Form.Item>
                </Form.Item>
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
            </>
          }
          title="Edit Field"
          trigger="click"
        >
          <i
            key={props.field.name}
            style={{ cursor: 'pointer' }}
            className="far fa-edit"
          ></i>
        </Popover>
      </div>
      <div className="line2">
        <span>Value: {props.field.value ? props.field.value : 'None'}</span>
        <Popover
          key={props.field.id}
          content={
            <a
              onClick={() => {
                delField(props.field.id);
              }}
            >
              {' '}
              yes{' '}
            </a>
          }
          title="Are you sure?"
          trigger="click"
        >
          <i
            key={props.field.name + props.field.id}
            style={{ cursor: 'pointer' }}
            className="far fa-trash-alt"
          ></i>
        </Popover>
      </div>
    </div>
  );
}

export default TypeFieldsCard;
