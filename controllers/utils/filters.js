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

const personalFilter = (key1,v1,key2,v2,key3,v3,key4,v4,data) => {
  return data.filter(function (v){return v[key1] == v1 && v[key2] == v2 || v[key3] == v3 && v[key4] == v4})
}

const personalFliter2 = (f1,f2,data) => {
  //return data.filter(function (v){v.createdAt >= f1 && v.createdAt <= f2 && v.Relevado == true})
  let arr = []
  let c = 0
  data.forEach(e => {
      if(e.createdAt >= f1 && e.createdAt <= f2 && e.Relevado == true){
        c = c + 1
      }
  })
  return c
}


const personalFliter4 = (f1,f2,data) => {
  let arr = []
  let c = 0
  data.forEach(e => {
      if(e.Date >= f1 && e.Date <= f2){
        c = c + 1
      }
  })
  return c
}


const personalFilter3 = (key1,v1,key2,v2,key3,v3,data) => {
  return data.filter(function (v){return v[key1] != v1 && v[key2] != v2 && v[key3] == v3})
}

const personalFilter5 = (key1,v1,key2,v2,data) => {
  return data.filter(function (v){return v[key1] == v1 && v[key2] != v2})
}

const personalFliter6 = (f1,f2,data) => {
  //return data.filter(function (v){v.createdAt >= f1 && v.createdAt <= f2 && v.Relevado == true})
  let arr = []
  let c = 0
  data.forEach(e => {
      if(e.createdAt >= f1 && e.createdAt <= f2 && e.Relevado == true && e.Año == null && e.Mes == null){
        c = c + 1
        arr.push(e)
      }
  })
  return arr
}

const getMeses = (mes) => {
  let arr = []
  for (i in [1,2,3,4,5,6,7,8,9,10,11,12]){
    if(mes > 0){
      arr.push(mes)
    }else{
      return arr
    }
    mes = mes - 1
  }
}

const returnDate = (año,num) => {
  let fecha = new Date(año,num,0).getDate()
  return fecha 
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
    filterByTwoKeyOR,
    personalFilter,
    personalFliter2,
    personalFilter3,
    personalFliter4,
    personalFilter5,
    personalFliter6,
    getMeses,
    returnDate
  }