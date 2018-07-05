import React, {Component} from 'react';
import './App.css';
import {
    Table,
    Input,
    Switch
} from "antd";

const Search = Input.Search;

const PARAM_API = "https://api.coinmarketcap.com/v2/ticker/";
const PARAM_CONVERT = "convert=CNY";
const PARAM_LIMIT = "limit=100";
const PARAM_SORT = "sort=rank";
const CNY_PRICE = "CNY";
const USD_PRICE = "USD";

const columns = [
    {
        title: "排名",
        dataIndex: "rank",
        key: "rank"
    },
    {
        title: "货币",
        dataIndex: "symbol",
        key: "name"
    },
    {
        title: "涨幅",
        dataIndex: "quotes.CNY.percent_change_1h",
        key: "quotes.CNY.percent_change_1h",
        render: (text, record, index) => {
            if (parseFloat(text) > 0) {
                return <span className="green-cell">{`+${text}%`}</span>;
            }
            return <span className="red-cell">{`${text}%`}</span>;
        }
    },
    {
        title: "价格(¥)",
        dataIndex: "quotes.CNY.price",
        key: "quotes.CNY.price",
        render: (text, record, index) => {
            return text.toFixed(4);
        }
    }
];
const isSearchCoin = (searchCoin) => {
    return (item) => {
        if (searchCoin) {
            return item.symbol.toLowerCase().includes(searchCoin.toLowerCase());
        }
        return true;
    };
};

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            coinlist: [],
            searchCoin: "",
            columns: columns,
            convert: CNY_PRICE,
        };
    };

    componentDidMount() {
        this.fetchMarketData();
        let intervalID = setInterval(this.fetchMarketData, 20000);
        this.setState({intervalID: intervalID});
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalID);
    }

    onSearch = (searchCoin) => {
        this.setState({
            searchCoin
        });
    };

    onChangeConvert = (event) => {
        const {convert} = this.state;
        const newConvert = convert === CNY_PRICE ? USD_PRICE : CNY_PRICE;
        this.setState({convert: newConvert});
        this.setMarketColumns(newConvert);

    };

    setMarketColumns = (convert) => {
        const oldColumn = this.state.columns;
        let updatedColumn = {};
        if (convert === CNY_PRICE) {
            updatedColumn = {
                title: "价格(¥)",
                dataIndex: "quotes.CNY.price",
                key: "quotes.CNY.price",
            };
            this.setState({
                    columns:
                        [
                            ...oldColumn.slice(0, 3),
                            Object.assign({}, this.state.columns[3], updatedColumn)
                        ]
                }
            );
        } else if (convert === USD_PRICE) {
            updatedColumn = {
                title: "价格($)",
                dataIndex: "quotes.USD.price",
                key: "quotes.USD.price",
            };
            this.setState({
                    columns:
                        [
                            ...oldColumn.slice(0, 3),
                            Object.assign({}, this.state.columns[3], updatedColumn)
                        ]
                }
            );
        }
    };

    setSearchCoinList = (coindata) => {
        let coins = Object.values(coindata.data);
        coins = coins.sort((a, b) => {
            return a.rank - b.rank;
        });
        coins = coins.map((item) => {
            return {...item, key: item.id}
        });
        this.setState({coinlist: coins});
    };

    fetchMarketData = (cointype = "") => {
        let url = "";
        if (cointype) {
            url = `${PARAM_API}${cointype}/?${PARAM_CONVERT}`;
        } else {
            url = `${PARAM_API}?${PARAM_CONVERT}&${PARAM_LIMIT}&${PARAM_SORT}`;
        }

        fetch(url)
            .then(results => results.json())
            .then(data => this.setSearchCoinList(data))
            .catch(e => e);
    };

    render() {

        const {coinlist, columns, searchCoin} = this.state;
        return (
            <div className="App">
                <h1 className="App-title">全球市值排行</h1>

                <div className="App-search">
                    <Search
                        placeholder="输入数字货币"
                        onSearch={value => this.onSearch(value)}
                        enterButton
                    />
                </div>
                <div className="App-convert">
                    <span>法币切换：</span>
                    <Switch
                        checkedChildren={CNY_PRICE}
                        unCheckedChildren={USD_PRICE}
                        defaultChecked
                        onChange={event => this.onChangeConvert(event)}/>

                </div>
                <div className="App-content">
                    <Table
                        pagination={false}
                        dataSource={coinlist.filter(isSearchCoin(searchCoin))}
                        columns={columns}
                    />
                </div>

            </div>

        );
    }
}

export default App;
