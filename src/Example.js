import React, { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import {Row, Button, Card, CardBody } from 'reactstrap';
import * as Icon from 'react-bootstrap-icons';

import { Colxx, Separator } from "../../../../components/common/CustomBootstrap";


const Example = () => {
  const serverSide = "/users/paginate";
  const column = [
    {
      name : "name",
      field : "name",
      sort :  true,
      search : {
        type : "text"
      }
    },
    {
      name : "email",
      field : "email",
      sort : false,
      search : {
        type : "date",
      },
    },
    {
      name : "status",
      field : "status",
      sort : false,
      search : {
        type : "option",
        data : [{name : "active", value : "active"}, {name : "inactive", value : "inactive" }]
      }
    },
    {
      name : "aksi",
      field : "",
      sort : false,
      search : null,
      render : (data) => {
        return (
          <div>
            <button className='btn btn-primary btn-sm' onClick={()=>{edit(data)}}><Icon.PencilSquare/></button> &nbsp;
            <button className='btn btn-danger btn-sm' onClick={()=>{edit(data)}}><Icon.Trash/></button>
          </div>
        );
      }
    }
  ]

  const edit = (data) => {
    console.log(data);
  }

  return (
      <React.Fragment>
        <Row>
         <Colxx xxs="12">
            <Card className="mb-4">
                <CardBody>
                    <DataTable
                      heading= "User"
                      serverSide={serverSide}
                      sortNumber={true}
                      column={column}
                    />
                </CardBody>
              </Card>
            </Colxx>
        </Row>
      </React.Fragment>
  );
}


export default 

