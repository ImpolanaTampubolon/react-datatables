import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardTitle, Table, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import { Colxx} from './common/CustomBootstrap';
// '../components/common/CustomBootstrap'
import {SkipStart, SkipEnd, CaretLeft, CaretRight} from "react-bootstrap-icons";
import sort_both from "../assets/img/sort_both.png";
import sort_asc from "../assets/img/sort_asc.png";
import sort_desc from "../assets/img/sort_desc.png";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DataTablePage from './DataTablePage';
import api from "../api";

const DataTable = ({serverSide, heading, sortNumber, column}) =>{
    const [loading, setLoading] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [startRecord, setStartRecord] = useState(0);
    const [endRecord, setEndRecord] = useState(0);
    const [totalRecord, setTotalRecord] = useState();

 
    const [data, setData] = useState([]);
    const [currentSort, setCurrentSort] = useState("");
    const [currentSortBy, setCurrentSortBy] = useState("");

    //datepicker
    // const [startDate, setStartDate] = useState(new Date());
    const [startDate, setStartDate] = useState("");
    const [startDateRange, setStartDateRange] = useState(new Date());
    const [endDateRange, setEndDateRange] = useState(new Date());

    const controller = new AbortController();
    let textTimer = null;
    
    useEffect(()=>{
        getData();
    },[currentSort]);

    useEffect(()=>{
      setCurrentSort('');
    },[currentSortBy]);


    function handleSearchText() {
      clearTimeout(textTimer);
      textTimer = null;
      textTimer = setTimeout(function(){
        getData();
      },1000);
    }

    function handleSearchPage(page){
      setCurrentPage(page);
      setTimeout(function(){
        getData();
      }, 200);
    }

  
    async function getData(){
      if(serverSide === null) {
        console.log("server not found");
        return
      }

      setLoading(true);
      const field = [];
      const keyword = [];

      if(column != null && column.length > 0) {
        for(var i in column){
          const searchs = column[i]['search'];
          const columnField = column[i]['field'];
          
          if(searchs != null) {
            const searchTypes = searchs['type'];

            switch(searchTypes){
              case 'date':
                if(startDate != ""){
                  field.push(columnField);
                  keyword.push(startDate);
                }
                break;                

              case 'date_range':                
                if(startDateRange !== "") {
                  field.push("start_"+columnField);
                  field.push("end_"+columnField);
                  keyword.push(startDateRange); 
                  keyword.push(endDateRange);
                }
                break;
              default:
                let val = document.getElementById(`id-${columnField}`).value;

                if(val !== "" || typeof(val) != 'undefined' || val != null) {
                  field.push(columnField);
                  keyword.push(val);
                }

              break;
            }

          }
          

        }
      }

      try{
          const postData = {keyword : JSON.stringify(keyword), field : JSON.stringify(field), page : parseInt(currentPage), sort_field : currentSortBy, sort_order : currentSort}
          const response = await api.post(serverSide, postData);
          
          const rData = response.data;
    

          setStartRecord(rData.start_record);
          setTotalPage(rData.total_page);
          setTotalRecord(rData.total_record);
          setEndRecord(rData.end_record);

          setData(Object.assign([], rData.data));
          setLoading(false)

      }catch (err) {
        setLoading(false)
      }

    }

    const renderSearch = ()=>{
      const searchRow = [];
      if(sortNumber) {
        searchRow.push(<th></th>)
      }

      column.map((item, index) => {
        const searchDt = item.search;

        if (searchDt === null) {
          return false;
        }

        switch (searchDt.type) {
          case 'text':
            searchRow.push( <th className='text-center'> <input onChange={handleSearchText} id={"id-"+item.field} onKeyUp={handleSearchText} className="form-control"/> </th>   );
            break;
          case 'option':
            if (typeof(searchDt.data) === 'undefined') {
              console.log('empty data option for '+item.name);
            }
            else{
              searchRow.push( 
                <th>
                    <select className='form-control' onChange={getData} id={"id-"+item.field}>
                    {
                      searchDt.data.map((item2, index2) => {
                        return (
                          <option value={item2.value}>{item2.name}</option>
                        );
                      })
                    }
                    </select>
                </th> 
                )
            }
            break;
          case 'date':
            searchRow.push(
              <th align='center'>
                <DatePicker
                  selected={startDate}
                  onChange={(dt)=>{setStartDate(dt);getData()}}
                />
              </th>
            );
            break;
            case 'date_range':
              searchRow.push(
                <th>
                    <div className='mb-1'>
                      <DatePicker
                        selected={startDateRange}
                        selectsStart
                        startDate={startDateRange}
                        endDate={endDateRange}
                        onChange={(d)=>{setStartDateRange(d);getData()}}
                      />
                    </div>
                    <DatePicker
                      selected={endDateRange}
                      selectsEnd
                      startDate={startDateRange}
                      endDate={endDateRange}
                      onChange={(d)=>{setEndDateRange(d);getData()}}
                    />
                </th>
              )
              break;
          default:
            searchRow.push(<th></th>);
            break;
        }

      });

      return (searchRow);
    }

    const renderRow = (item, index) => {
      const row = [];

      if(sortNumber){
        row.push(<td key={`${index}-td`}>{index+1}</td>);
      }

      column.map((cl,ind)=>{
        const fieldName = cl.field;
        if(fieldName === "" && cl.render != null){
            row.push(<td key={`${ind}-${cl}`}>{cl.render(item)}</td> );
        }
        else{
            row.push(<td>{item[fieldName]}</td>)
        }

      });
      return (row);
    }



    const changeSorting = (e) => {
      const cTarget = e.currentTarget;
      const img = cTarget.querySelector('img');
      const column = cTarget.getAttribute('column');      
      const parent = cTarget.parentElement.parentElement.parentElement;
      const allSortingColumn = parent.querySelectorAll('.sorting');

      for(var i=0;i<allSortingColumn.length;i++){
        const iTarget = allSortingColumn[i];
        if(iTarget.getAttribute('column') === currentSortBy) {
          // setCurrentSort('asc');
          iTarget.querySelector('img').setAttribute('src', sort_both);
          break;
        }
     }     

     setCurrentSortBy(column);
 
      switch (currentSort) {
        case 'asc':
          setCurrentSort('desc');
          img.setAttribute('src', sort_desc);
          break;
        case 'desc':
          setCurrentSort('');
          img.setAttribute('src', sort_both);
          break;
        default:
          setCurrentSort('asc');
          img.setAttribute('src', sort_asc);
          break;
      }
    }

    return (
        <React.Fragment>
            {loading ? <div className='loadingTable'>Loading</div> : ""}
                  <Table hover className="sortable dataTable">                
                    <thead>
                      <tr>
                        {sortNumber ? <th>#</th> : ""}

                        {
                          column.length > 0 ?
                          column.map((item, index)=>{
                            return (
                                <th key={`th-${index}`} field-name={item.field} onClick={ item.sort ? changeSorting : ()=>{} } className={item.sort ? "sorting" : ""} >{item.name} {item.sort ? <img src={sort_both} /> : ""}</th>
                            )
                          })
                          : ""
                        }
                      </tr>
                      <tr>
                      {renderSearch()}
                      </tr>
                    </thead>                   
                    <tbody>
                        {
                          data.length > 0 ?
                            data.map((item, index)=>{
                           
                              return(
                                <tr key={`${index}_tr`}>{renderRow(item,index)}</tr>
                              )
                            })
                          : <tr><td colSpan={column.length + 1} align="center">Tidak ada data</td></tr>
                        }
                    </tbody>
                  </Table> 
              
                  {
                    data.length > 0 ?
                    <DataTablePage
                      totalPage = {totalPage}
                      page = {currentPage}
                      startRecord = {startRecord}
                      endRecord = {endRecord}
                      totalRecord = {totalRecord}
                      search = {handleSearchPage}
                    />
                    :
                    <div></div>
                  }
        </React.Fragment>
            
    )
}

DataTable.defaultProps = {
  heading : "",
  sortNumber : true,
  serverSide : null,
  column : [],
}

// const defaultColumn = {
//   name : "",
//   field : "",
//   sort : false,
//   search : {  // if null hide search bar
//     type : "option",  //type of search [text, number, custom =()=> render(data), option =()=>data[name, value], date, between_date]
//     data : [],
//     render : function(data) { ->>> for column custom
//}
//   },
//   render : null, // this is for custorm like action button
// }


export default DataTable;