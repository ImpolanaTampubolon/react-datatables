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
import { NotificationManager } from './react-notifications';

//function that return boolean
const DataTable = ({serverSide, heading, sortNumber, column, reload, setReload}) =>{

    const loadingStyle = {
        position: "absolute",
        left: 0,
        right: 0,
        textAlign: "center",
        height: "80%",
        width: "100%",
        opacity: "0.5",
        top: "15%",
        background : "#fff",
        display: "flex",
        alignItems: "center",
        bottom: "0",
        zIndex: 2
    }

    const childStyle = {
      zIndex: 3,
      opacity: 1,
      color: "black",
      margin: "auto",
      marginTop: "10px",
      fontSize: "20px"
    }

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
  

    useEffect(() => {
      if(reload){
        getData();
      }
    },[reload])
  
    useEffect(()=>{
        getData();
    
    },[currentSort]);


    useEffect(()=>{
      setTimeout(function(){
        getData();
      }, 200);
    },[currentPage])

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

          if(typeof rData.error !== "undefined"){
              NotificationManager.error(rData.error, "Error", 3000, null, null, '');
          }

          setStartRecord(rData.start_record);
          setTotalPage(rData.total_page);
          setTotalRecord(rData.total_record);
          setEndRecord(rData.end_record);

          setData(Object.assign([], rData.data));
          setLoading(false)

          if(typeof setReload != "undefined") {
            setReload(false);
          }

      }catch (err) {
        setLoading(false)
      }

    }

    const renderSearch = ()=>{
      const searchRow = [];
      if(sortNumber) {
        searchRow.push(<th key={"emptyrendersearch"}></th>)
      }

      column.map((item, index) => {
        const searchDt = item.search;

        if (searchDt === null) {
          return false;
        }

        switch (searchDt.type) {
          case 'text':
            searchRow.push( <th key={`${index}-textsearch`} className='text-center'> <input onChange={handleSearchText} id={"id-"+item.field} onKeyUp={handleSearchText} className="form-control"/> </th>   );
            break;
          case 'option':
            if (typeof(searchDt.data) === 'undefined') {
              console.log('empty data option for '+item.name);
            }
            else{
              searchRow.push( 
                <th key={"optionsearch"}>
                    <select className='form-control' onChange={getData} id={"id-"+item.field}>
                    {
                      searchDt.data.map((item2, index2) => {
                        return (
                          <option key={`${index2}-option`} value={item2.value}>{item2.name}</option>
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
              <th align='center' key={`${index}-datepicker`}>
                <DatePicker
                  selected={startDate}
                  onChange={(dt)=>{setStartDate(dt);getData()}}
                />
              </th>
            );
            break;
            case 'date_range':
              searchRow.push(
                <th key={`${index}-daterange`}>
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
            searchRow.push(<th key={`emptyposearch`}></th>);
            break;
        }

      });

      return (searchRow);
    }

    const renderRow = (item, index) => {
      const row = [];

      if(sortNumber){
        let num = currentPage * (index  + 1);
        row.push(<td key={`${index}-td-sortnumber`}>{ num }</td>);
      }

      column.map((cl,ind)=>{
        const fieldName = cl.field;

        let align = '';
        
        if(typeof(cl.align) != 'undefined' && cl.align != ""){
          align = cl.align;
        }
        else{
          align='left';
        }

        if(fieldName === "" && cl.render != null){
            row.push(<td align={align} key={`${ind}-fieldname`}>{cl.render(item)}</td> );
        }
        else{
            row.push(<td key={`${ind}-emptyfieldname`}>{item[fieldName]}</td>)
        }

      });
      return (row);
    }

    const showLoading = () => {
      return (
        <div className='loadingTable' style={loadingStyle}>
            <div style={childStyle}>Loading</div>
        </div>
      );
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
        <div style={{position:"relative"}}>
            {loading ?  showLoading() : ""}
                  <Table hover className="sortable dataTable">                
                    <thead>
                      <tr key={"thead"}>
                        {sortNumber ? <th key={"empty-data"}>#</th> : ""}

                        {
                          column.length > 0 ?
                          column.map((item, index)=>{
                            return (
                                <th key={`${index}-thead`}  field-name={item.field} onClick={ item.sort ? changeSorting : ()=>{} } className={item.sort ? "sorting" : ""} >{item.name} {item.sort ? <img src={sort_both} /> : ""}</th>
                            )
                          })
                          : ""
                        }
                      </tr>
                      <tr key={"thead-search"}>
                      {renderSearch()}
                      </tr>
                    </thead>                   
                    <tbody>
                        {
                          data.length > 0 ?
                            data.map((item, index)=>{                           
                              return(
                                <tr key={`${index}-tr`}>{renderRow(item,index)}</tr>
                              )
                            })
                          : <tr key={"tr-no-data"}><td key={`td-no-data`} colSpan={column.length + 1} align="center">Tidak ada data</td></tr>
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
        </div>
            
    )
}

DataTable.defaultProps = {
  heading : "",
  sortNumber : true,
  serverSide : null,
  column : [],
  reload : false
}

// const defaultColumn = {
//   name : "",
//   field : "",
//   sort : false,
//   width : ,
//   align : "center",
//   search : {  // if null hide search bar
//     type : "option",  //type of search [text, number, custom =()=> render(data), option =()=>data[name, value], date, between_date]
//     data : [],
//     render : function(data) { ->>> for column custom
//}
//   },
//   render : null, // this is for custorm like action button
// }


export default DataTable;
