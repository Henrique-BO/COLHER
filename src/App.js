import './App.css';
import {ReactComponent as ReactLogo} from './logo.svg';
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
      <div id="container-resumo">

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
  let time = new Date(time_string);
  let formatted = "";
  if (time_string) {
    formatted = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} às ${time.getHours()}h${time.getMinutes()}`;
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
    let pedidos_periodo = null;
    if (this.state.pedidos) {
      if (periodo === "Sempre") {
        pedidos_periodo = this.state.pedidos;
      } else {
        let now = new Date();
        let hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (periodo === "Essa semana") {
          let semana_passada = new Date(hoje - 7*24*60*60*1000);
          pedidos_periodo = this.state.pedidos.filter((pedido) => new Date(pedido.time_realizado) - semana_passada > 0);
        } else if (periodo === "Hoje") {
          pedidos_periodo = this.state.pedidos.filter((pedido) => new Date(pedido.time_realizado) - hoje > 0);
        }
      }
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
        <main id="container-principal">
          <ReactLogo/>
          <h1>GARFO<br/>Dashboard</h1>

          <div id="button-container">
            <Button onClick={() => this.onClick("Sempre")} className={this.state.periodo === "Sempre" ? "selected" : null}>
              Sempre
            </Button>
            <Button onClick={() => this.onClick("Essa semana")} className={this.state.periodo === "Essa semana" ? "selected" : null}>
              Essa semana
            </Button>
            <Button onClick={() => this.onClick("Hoje")} className={this.state.periodo === "Hoje" ? "selected" : null}>
              Hoje
            </Button>
          </div>

          <Resumo pedidos_periodo={pedidos_periodo}/>
          <PedidosTable pedidos_periodo={pedidos_periodo}/>
        </main>
      </div>
    );
  }

}

export default App;
