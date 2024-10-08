import React from 'react';
import './App.css';
import TimeTablePage from "./TimeTablePage/TimeTablePage";
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import DiagramPage from "./Diagram/DiagramPage";
import { TimeTablePDF } from './TimeTablePage/TimeTablePDF/TimeTablePDF';
import {LicensePage} from "./Help/LicensePage";
import {DiagramPDFPage} from "./Diagram/DiagramPDF/DiagramPDFPage";
import {OuDiaOpenDialog} from "./Menu/OuDiaOpenDialog";
import {CompanyListPage} from "./CompanyPage/CompanyListPage.tsx";
import {CompanyPage} from "./CompanyPage/CompanyPage.tsx";

function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={
            <CompanyListPage/>
        }/>
          <Route path="/Company/:companyID" element={
              <CompanyPage/>
          }/>
          <Route path="/TimeTable/:companyID/:routeID/:direct" element={
              <TimeTablePage/>
          }></Route>
          <Route path="/TimeTablePDF/:companyID/:routeID" element={
              <TimeTablePDF/>
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

      </Routes>
      </BrowserRouter>
  );
}

export default App;
