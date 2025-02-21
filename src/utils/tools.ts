export const timeFormter = (time:string) => {
    var data = new Date(time);
    // 封装年份时间
    var y = data.getFullYear();
    // 封装月份时间
    var m = data.getMonth();
    // 封装日期时间
    var d = data.getDate();
    // 转换详细时分
    var hours =
      data.getHours() < 10 ? "0" + data.getHours() : data.getHours();
    var minutes =
      data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes();
    // 输出转换后时间节点
    return `${hours}:${minutes}`;
  }

  export const dayFormter = (time:number) => {
    var data = new Date(time);
    // 封装年份时间
    var y = data.getFullYear();
    // 封装月份时间
    var m = data.getMonth();
    // 封装日期时间
    var d = data.getDate();
    return `${y}-${m<10?'0'+m:m}-${d<10?'0'+d:d}}`;
  }


export function filterEmptyValues(obj:any) {
  const newObj:any = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '' && !Number.isNaN(obj[key]) && obj[key] !== Infinity && obj[key] !== -Infinity&& obj[key] !== undefined && obj[key] !== 'undefined') {
        newObj[key] = obj[key]
      }
    }
  }
  return newObj // 过滤完的新对象
}