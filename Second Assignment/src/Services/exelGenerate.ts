import { Workbook } from "exceljs";

export async function createExcelFile(data:unknown[][]) {

  const workbook = new Workbook()
  const worksheet = workbook.addWorksheet("New Sheet");


  const dropdownValues = [
    "abacus",
    "breeze",
    "cactus",
    "dynamo",
    "echo",
    "falcon",
    "giraffe",
    "horizon",
    "igloo",
    "jungle",
    "kangaroo",
    "lighthouse",
    "mosaic",
    "nectar",
    "opal",
    "pebble",
    "quilt",
    "raven",
    "sunrise",
    "tornado",
    "umbrella",
    "vortex",
    "whisper",
    "xenon",
    "yellow",
    "zebra",
    "astronomy",
    "basilisk",
    "circuit",
    "delicate",
    "eclipse",
    "ferocity",
    "glisten",
    "harmony",
    "intrepid",
    "jovial",
    "keystone",
    "lunar",
    "mystic",
    "nebulous",
    "orchestra",
    "pinnacle",
    "quasar",
    "radiant",
    "sapphire",
    "tapestry",
    "universe",
    "velocity",
    "wanderlust",
    "xylophone",
    "yearning",
    "zephyr",
    "alchemy",
    "brilliant",
    "cascade",
    "divine",
    "enigma",
    "fathom",
    "glacier",
    "hallowed",
    "ignite",
    "juxtapose",
    "kaleidoscope",
    "luminous",
    "maelstrom",
    "nebula",
    "outlandish",
    "puzzle",
    "quixotic",
    "ripple",
    "serenity",
    "turbulence",
    "utopia",
    "vibrant",
    "whimsy",
    "xenophile",
    "yonder",
    "zenith",
    "arcane",
    "blissful",
    "celestial",
    "driftwood",
    "ephemeral",
    "flourish",
    "gossamer",
    "harmony",
    "illusion",
    "jubilant",
    "keystone",
    "lullaby",
    "monolith",
    "nirvana",
    "opulent",
    "pristine",
    "quench",
    "resonance",
    "silhouette",
    "tempest",
    "unity",
    "vivid",
    "whirlpool",
    "xylocarp",
    "yoga",
    "zen",
    "avalanche",
    "bountiful",
    "crimson",
    "dappled",
    "equilibrium",
    "frostbite",
    "gravitational",
    "hallowed",
    "interlude",
    "journey",
    "kismet",
    "legendary",
    "mirage",
    "nectar",
    "oasis",
    "pulse",
  ];

  const W_colums = [];
  data.map((colums,id_x)=>{
    if(id_x === 0){
      colums.map((title:any,ind)=>{
        W_colums.push({ header: `${title}`, key: `${title}`, width: 20 });
        if(ind === colums.length-1){
          worksheet.columns = [
            ...W_colums,
            {header: "status",key:"status"}
          ];
        }
      })
    }else{
      const Row_data = {}
      colums.map((data,data_in_X)=>{
        Row_data[W_colums[data_in_X].header] = data

        if(colums.length-1 === data_in_X){
          worksheet.addRow(Row_data)
        }})
    }})

  // worksheet.columns = [
  //   { header: "ID", key: "ID", width: 10 },
  //   { header: "status", key:"status" ,width: 10 },
  //   { header: "Name", key: "Name", width: 20 },
  //   { header: "status1", key:"status1", width: 10 },
  //   { header: "Age", key: "Age", width: 10 },
  //   { header: "status2", key:"status2" ,width: 10 },
  //   { header: "Country", key: "Country", width: 20 },
  //   { header: "status3", key:"status3" ,width: 10 },
  // ];

  //  worksheet.addRow({ Name: "Abcd", Age: 32, Country: "India" });
  //  worksheet.addRow({ Name: "Abcd", Age: 32, Country: "India" });
  //  worksheet.addRow({ Name: "Abcd", Age: 32, Country: "India" });
  //  worksheet.addRow({ Name: "Abcd", Age: 32, Country: "India" });
  //  worksheet.addRow({ Name: "Abcd", Age: 32, Country: "India" });
  //  worksheet.addRow({ Name: "Abcd", Age: 32, Country: "India" });


    dropdownValues.forEach((value, index) => {
      worksheet.getCell(`Z${index + 1}`).value = value;
    });

  worksheet.getColumn("status").eachCell((cell, rowNumber) => {


    if (rowNumber > 1) {
      cell.dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: ["=Z1:Z" + dropdownValues.length],
      };
    }
  });

  // worksheet.getColumn("status1").eachCell((cell, rowNumber) => {
  //   if (rowNumber > 1) {
  //     cell.dataValidation = {
  //       type: "list",
  //       allowBlank: true,
  //       formulae: ["=Z1:Z" + dropdownValues.length],
  //     };
  //   }
  // });



  // worksheet.getColumn("status2").eachCell((cell, rowNumber) => {
  //   if (rowNumber > 1) {
  //     cell.dataValidation = {
  //       type: "list",
  //       allowBlank: true,
  //       formulae: ["=Z1:Z" + dropdownValues.length],
  //     };
  //   }
  // });

  // worksheet.getColumn("status3").eachCell((cell, rowNumber) => {
  //   if (rowNumber > 1) {
  //     cell.dataValidation = {
  //       type: "list",
  //       allowBlank: true,
  //       formulae: ["=Z1:Z" + dropdownValues.length],
  //     };
  //   }
  // });
  
  //  console.log("Colums After Add => ", worksheet);

  // Create Excel file
  // const options = {
  //   "!merges": [], // Optional
  // };
  // const excelBuffer = build([{ name: "My Sheet", data ,options}]);

  console.log("Excel file created!");

  return await workbook.xlsx.writeBuffer(); // Return Buffer Data Of Excel
}
