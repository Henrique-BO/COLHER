import './App.css';
import React from 'react';


function Resumo(props) {
  const {pedidos_periodo} = props;
  let receita = 0;
  let mais_pedido = null;
  
  if (pedidos_periodo) {
    let itens_pedidos = Object.values(pedidos_periodo.reduce(function (acc, pedido) {
      receita = pedidos_periodo.reduce((acc, pedido) => acc += pedido.item.preco, 0);
      if (acc[pedido.item.id]) {
        ++acc[pedido.item.id]['count'];
      } else {
        acc[pedido.item.id] = {...pedido.item, count: 1};
      }
      return acc;
    } , {}));
    mais_pedido = itens_pedidos.reduce((acc, item) => item.count > acc.count ? item : acc, itens_pedidos[0]);  
  }
  

  return (
    <div className="Resumo">
      <h2>Resumo</h2>
      <div id="button-container">

        <div class="card">
          <h3>Receita:</h3>
          <p>R${receita.toFixed(2)}</p>
        </div>
        <div class="card">
          <h3>Item mais pedido: </h3>
          <p>
            { mais_pedido ? (
              <span> {mais_pedido.nome} ({mais_pedido.count} {mais_pedido.count === 1 ? 'vez' : 'vezes'})</span>
            ) : ' Não há pedidos no período selecionado' }
          </p> 
        </div>
      </div>
    </div>
  );
}

function PedidosTable(props) {
  const {pedidos_periodo} = props;
  return (
    <div className="PedidosTable">
      <h2>Pedidos</h2>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Cliente</th>
            <th>Item</th>
            <th>Realizado em</th>
            <th>Preparando em</th>
            <th>Pronto em</th>
            <th>Entregue em</th>
          </tr>
        </thead>
        <tbody>
          {pedidos_periodo ?
          pedidos_periodo
          .map((pedido) => (
            <tr key={pedido.id}>
              <td>{pedido.id}</td>
              <td>{pedido.cliente.user.username}</td>
              <td>{pedido.item.nome}</td>
              <td>{format_time(pedido.time_realizado)}</td>
              <td>{format_time(pedido.time_preparando)}</td>
              <td>{format_time(pedido.time_pronto)}</td>
              <td>{format_time(pedido.time_entregue)}</td>
            </tr>
          )) : null}
        </tbody>
      </table>
    </div>
  )
}

function format_time(time_string) {
  let formatted = "";
  if (time_string) {
    formatted = time_string.slice(8,10)+'/'+time_string.slice(5,7)+' às '+time_string.slice(11,16);
  }
  return formatted;
}

function Button(props) {
  const {
    onClick,
    className='',
    children,
  } = props;

  return (
    <button
      onClick={onClick}
      className={className}
      type="button"
    >
      {children}
    </button>
  );
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      pedidos: null,
      pedidos_periodo: null,
      periodo: "Sempre",
    };
  }

  onClick(periodo) {
    let pedidos_periodo;
    if (periodo === "Sempre") {
      pedidos_periodo = this.state.pedidos;
      this.setState({ pedidos_periodo: pedidos_periodo })
    } else if (periodo == "Essa semana") {
      let today = new Date();
      let today_string = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate()-7);
      pedidos_periodo = this.state.pedidos.filter((pedido) => pedido.time_realizado.slice(0,10) <= today_string);
    } else if (periodo == "Hoje") {
      let today = new Date();
      let today_string = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+(today.getDate());
      pedidos_periodo = this.state.pedidos.filter((pedido) => pedido.time_realizado.slice(0,10) === today_string);
    }
    this.setState({ pedidos_periodo: pedidos_periodo, periodo: periodo })
  }

  componentDidMount() {
    fetch('http://127.0.0.1:8000/api/v1/pedidos/')
      .then((response) => response.json())
      .then((result) => this.setState({ pedidos: result, pedidos_periodo: result }))
      .catch((error) => error);
  }

  render() {
    const {pedidos_periodo} = this.state;

    return (
      <div className="App" id="body_roxo">
        <header id="cabecalho-principal">
        </header>

        <main id="container-principal">
          <h1>GARFO - Dashboard</h1>

          <Button onClick={() => this.onClick("Sempre")}>Sempre</Button>
          <Button onClick={() => this.onClick("Essa semana")}>Essa semana</Button>
          <Button onClick={() => this.onClick("Hoje")}>Hoje</Button>
          <p>Período selecionado: {this.state.periodo}</p>
          <Resumo pedidos_periodo={pedidos_periodo}/>
          <PedidosTable pedidos_periodo={pedidos_periodo}/>
        </main>
      </div>
    );
  }

}

export default App;
