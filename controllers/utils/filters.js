const dayjs = require("dayjs")

const base = (v1, data) => {
    let filtrado = data.filter(function (v){return v.Merchandising == v1})
  
    return filtrado.length
  }

  const objMes = (v1,v2,v3,data) => {
    let filtrado2 = data.filter(function (v){return v.Merchandising == v1 && v.Año == v2 && v.Mes == v3})
  
    return filtrado2.length
  }

  const relevados = (v1,v2,v3,v4,data) => {
    let filtrado3 = data.filter(function (v){return v.Merchandising == v1 && v.Año == v2 && v.Mes == v3 && v.Relevado == v4})
  
    return filtrado3.length
  }

  const getMerchaReleved = (v1, data) => {
    let filtrado = data.filter(function (v){
      return v.Merchandising == v1 && 
      v.Relevado == true
                    })
  
    return filtrado
  }

  const getSellerReleved = (v1, data) => {
    let filtrado = data.filter(function (v){
      return v.Vendedor == v1 && 
      v.Relevado == true
                    })
  
    return filtrado
  }

  const getDataMercha = (v1, data) => {
    let filtrado = data.filter(function (v){
      return v.Merchandising == v1})
  
    return filtrado
  }

  const filterByOneKey = (key1,v1,data) => {
    return data.filter(function (v){return v[key1] == v1})
  }
  const filterByTwoKey = (key1,v1,key2,v2,data) => {
    return data.filter(function (v){return v[key1] == v1 && v[key2] == v2})
  }
  const filterByThreeKey = (key1,v1,key2,v2,key3,v3,data) => {
    return data.filter(function (v){return v[key1] == v1 && v[key2] == v2 && v[key3] == v3})
  }
  const filterByFourKey = (key1,v1,key2,v2,key3,v3,key4,v4,data) => {
    return data.filter(function (v){return v[key1] == v1 && v[key2] == v2 && v[key3] == v3 && v[key4] == v4})
  }

  const filterCuntNoObjetive = (key1,v1,key2,v2,key3,v3,key4,v4,key5,v5,data) => {
    
    return data.filter(function (v){return v[key1] == v1 && v[key2] == v2 && v[key3] == v3 && v[key4] >= v4 &&  v[key5] <= v5})
  }

  const filterSpecial = (data,f1,f2,type) => {
    let arr = []
    data.forEach(e => {
      if(new Date(formatoFecha(e.Date)) >= f1 && new Date(formatoFecha(e.Date)) <= f2){
        let obj = {
          Codigo_Cliente:e.Codigo_Cliente,
          Nombre:e.Nombre,
          Direccion:e.Direccion,
          Type: type,
          Pictures:e.Pictures
        }
       
        if(type == 'MERCHA'){
          obj.User = e.Merchandising
          obj.Nombre_User= e.Nombre_Merchandising
        }
        if(type == 'SELLER'){
          obj.User = e.Vendedor
          obj.Nombre_User= e.Nombre_Vendedor
        }
        
        arr.push(obj)
      }
    })//end
    return arr
  }

  function formatoFecha(fecha) {
    let arr =  fecha.split('-')
    return arr[2]+'-'+arr[1]+'-'+arr[0]
  }

  function completeDate(num){
    if(num == 10 || num == 11 || num == 12){
      return num
    }
    return String('0'+num)
  }


  function SortArrayDesc(a, b){
    return (b.Date - a.Date)
}

const filterByThreeKeyOR = (key1,v1,key2,v2,key3,v3,data) => {
  return data.filter(function (v){return v[key1] == v1 || v[key2] == v2 || v[key3] == v3})
}

const filterByTwoKeyOR = (key1,v1,key2,v2,data) => {
  return data.filter(function (v){return v[key1] == v1 || v[key2] == v2})
}

  module.exports = {
    base,
    objMes,
    relevados,
    getMerchaReleved,
    getSellerReleved,
    getDataMercha,
    filterByOneKey,
    filterByTwoKey,
    filterByThreeKey,
    filterByFourKey,
    SortArrayDesc,
    filterSpecial,
    filterCuntNoObjetive,
    filterByThreeKeyOR,
    filterByTwoKeyOR
  }