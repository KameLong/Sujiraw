import React from 'react';
import './App.css';
import RouteTimeTablePage from "./TimeTablePage/RouteTimeTable/RouteTimeTablePage.tsx";
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import DiagramPage from "./Diagram/DiagramPage";
import { TimeTablePDF } from './TimeTablePage/TimeTablePDF/TimeTablePDF';
import {LicensePage} from "./Help/LicensePage";
import {DiagramPDFPage} from "./Diagram/DiagramPDF/DiagramPDFPage";
import {OuDiaOpenDialog} from "./Menu/OuDiaOpenDialog";
import {CompanyListPage} from "./CompanyPage/CompanyListPage.tsx";
import {CompanyPage} from "./CompanyPage/CompanyPage.tsx";
import {TimeTableEditPage} from "./CompanyPage/TimeTableEditPage.tsx";
import {CustomTimeTablePage} from "./TimeTablePage/CustomTimeTable/CustomTimeTablePage.tsx";
import TestPage from "./TimeTablePage/RouteTimeTable/TestPage.tsx";

function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={
            <CompanyListPage/>
        }/>
          <Route path="/test" element={
              <TestPage/>
          }/>
          <Route path="/Company/:companyID" element={
              <CompanyPage/>
          }/>
          <Route path="/TimeTable/:companyID/:routeID/:direct" element={
              <RouteTimeTablePage/>
          }></Route>
          <Route path="/MainTimeTable/:companyID/:timetableID/:direct" element={
              <CustomTimeTablePage/>
          }></Route>
          <Route path="/TimeTablePDF/:companyID/:routeID" element={
              <TimeTablePDF/>
          }></Route>
          <Route path={"/TimeTableEdit/:companyID/:timetableID"} element={
              <TimeTableEditPage/>
            }></Route>
          <Route path="/Diagram/:companyID/:routeID" element={
              <DiagramPage/>
          }></Route>
          <Route path="/DiagramPDF/:companyID/:routeID" element={
              <DiagramPDFPage/>
          }></Route>
          <Route path="/License" element={
              <LicensePage/>
          }></Route>
          <Route path="/Oudia" element={
              <OuDiaOpenDialog/>
          }></Route>
          <Route path="*" element={
              <div>Page not found</div>
          }> </Route>

      </Routes>
      </BrowserRouter>
  );
}

export default App;
