export function GetFormattedDate(date) {
        const weekDays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
        const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
        return ((weekDays[(date.getDay())] + ", " + date.getDate() + " de " + months[(date.getMonth())] + " de " + date.getFullYear() + "."));
};

export function GetShortFormattedDate(date) {
    var day = date.getDate();
    var month = date.getMonth()+1; 
    var year = date.getFullYear();
    if(day < 10) 
    {
        day= '0' + day;
    } 

    if(month < 10) 
    {
        month = '0' + month ;
    } 
    return day + '/' + month + '/' + year
}