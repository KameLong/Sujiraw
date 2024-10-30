import Grid from "@mui/material/Grid2";
import {Search, SearchIconWrapper, StyledInputBase} from "../CMN/Styles.ts";
import SearchIcon from "@mui/icons-material/Search";
import * as React from "react";
import {useState} from "react";

// export function SearchTitleBar() {
//     return (
//         <div>
//             <Grid style={{backgroundColor: "#242"}}>
//                 <span style={{
//                     padding: '10px',
//                     fontSize: "28pt",
//                     fontFamily: 'serif',
//                     color: '#EEE',
//                     fontWeight: 900
//                 }}>すじらう</span>
//                 <span style={{
//                     padding: '10px',
//                     fontSize: "16pt",
//                     color: '#DDF',
//                 }}>by Kamelong</span>
//             </Grid>
//             <Grid container style={{backgroundColor: "#000"}}>
//
//                 <Search>
//                     <SearchIconWrapper>
//                         <SearchIcon/>
//                     </SearchIconWrapper>
//                     <StyledInputBase
//                         placeholder="Search…"
//                         value={searchText}
//                         onChange={(e) => setSearchText(e.target.value)}
//                         inputProps={{'aria-label': 'search'}}
//                     />
//                 </Search>
//             </Grid>
//         </div>
// )
// }