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

  module.exports = {
    base,
    objMes,
    relevados,
    getMerchaReleved,
    getSellerReleved
  }