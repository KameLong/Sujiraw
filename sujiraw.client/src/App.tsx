import React from 'react';
import './App.css';
import TimeTablePage from "./TimeTablePage/TimeTablePage";
import {BrowserRouter, Route, Routes } from 'react-router-dom';
import DiagramPage from "./Diagram/DiagramPage";
import { TimeTablePDF } from './TimeTablePage/TimeTablePDF/TimeTablePDF';
import {LicensePage} from "./Help/LicensePage";
import {DiagramPDFPage} from "./Diagram/DiagramPDF/DiagramPDFPage";
import {OuDiaOpenDialog} from "./Menu/OuDiaOpenDialog";

function App() {
  return (
      <BrowserRouter>
      <Routes>
        <Route path="/" element={
          // <TimeTablePage/>
            <OuDiaOpenDialog/>
        }/>
          <Route path="/TimeTable/:routeID/:direct" element={
              <TimeTablePage/>
          }></Route>
          <Route path="/TimeTablePDF/:routeID" element={
              <TimeTablePDF/>
          }></Route>
          <Route path="/Diagram/:routeID" element={
              <DiagramPage/>
          }></Route>
          <Route path="/DiagramPDF/:routeID" element={
              <DiagramPDFPage/>
          }></Route>
          <Route path="/License" element={
              <LicensePage/>
          }></Route>

      </Routes>
      </BrowserRouter>
  );
}

export default App;
