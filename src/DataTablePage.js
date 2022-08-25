import React, { Fragment, useEffect, useState } from 'react';
import { Row, Card, CardBody, CardTitle, Table, Pagination, PaginationItem, PaginationLink } from 'reactstrap';
import {SkipStart, SkipEnd, CaretLeft, CaretRight} from "react-bootstrap-icons";

const DataTablePage = ({page, startRecord, endRecord, totalRecord, totalPage, search}) => {  

    useEffect(()=>{
    }, []);

    const renderPage = () => {
        let navp = [];
        let navn = [];
        let navfirst = [];
        let navlast = [];
        let pageLink = [];
        let navigation = [];

        navigation.push(<React.Fragment> Page <b>{page}</b> of <b>{totalPage}</b> </React.Fragment>);

        if(totalPage > 1) {
            navp.push(<React.Fragment><a className='pagenavs' title='Previous' href='#' onClick={()=>{ search(parseInt(page) - 1) }}>&lt;</a>&nbsp;</React.Fragment>);
            navn.push(<a className='pagenavs' title='Next' href='#' onClick={()=>{ search(parseInt(page) + 1)}}>&gt;</a>);
            navfirst.push(<React.Fragment><a className='pagenavs' title='First Page' href='#' onClick={()=>{ search(1) }}>&lt;&lt;</a>&nbsp;&nbsp;</React.Fragment>);
            navlast.push(<a className='pagenavs' title='Last Page' href='#' onClick={ ()=>{ search(totalPage) } }>&gt;&gt;</a>);

            if(page == 1) {
                navp = [];
                navfirst = [];
            }
            else if(page == totalPage){
                navn = [];
                navlast = [];
            }

            pageLink.push( ...navfirst );
            pageLink.push( ...navp );
            let left = page - 5;
            let right = parseInt( page ) + 5 ;

            if (left < 1){
                right += Math.abs(left) + 1;
                left = 1;
            }

            if (right > totalPage) {
                left += (totalPage - right);
                if (left < 1)
                    left = 1;
                right = totalPage;
            }

            if (left > 1){
                pageLink.push(<React.Fragment>...&nbsp;</React.Fragment>);
            }

            for (var l = left; l <= right; l++){
                const finalPage = l;


                if (l === page){
                    pageLink.push(<React.Fragment><span className="activepagenavs">{l}</span>&nbsp;</React.Fragment>)
                }
                else{
                    pageLink.push(<React.Fragment><a className="pagenavs" onClick={()=>{search(finalPage)}} href="#"><b>{l}</b></a>&nbsp;</React.Fragment>)	
                }
            }
            if (right < totalPage){
                pageLink.push(<React.Fragment>... &nbsp;&nbsp;</React.Fragment>);
            }

            pageLink.push(...navn);
            pageLink.push(...navlast);

            const renderPageLink = pageLink.map((item) => {
                return (item);
            });
            
            navigation.push(<React.Fragment>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; { renderPageLink } </React.Fragment>);
        }        

        return navigation;
    }

    return (

        <div className='row'>
            <div className='col-6'>
                <span>Record {startRecord} - {endRecord} of total {totalRecord}</span>
            </div>

            <div className='col-6 text-right'>
            { renderPage() }
            </div>

        </div>
    )
}

export default DataTablePage;