import faker from 'faker';
import React from 'react';
import MyTable from './components/my-table/MyTable';

function App() {
  const fetchDatasource = () =>
    new Array(100).fill(true).map(() => ({
      accountName: faker.finance.accountName(),
      name: faker.name.findName(),
      // name: [
      //   { firstname: faker.name.firstName(), lastname: faker.name.lastName() },
      //   { firstname: faker.name.firstName(), lastname: faker.name.lastName() },
      // ],
      amount: faker.finance.amount(),
      transactionType: faker.finance.transactionType(),
      date: faker.date.recent(),
      creditCardNumber: faker.finance.creditCardNumber(),
      account: faker.finance.account(),
    }));

  const fetchFilters = () => {
    return [
      {
        key: 'account',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'amount',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'transactionType',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'date',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'creditCardNumber',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'name',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'accountName',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
    ];
  };

  const fetchColumns = () => [
    { key: 'name', label: 'Name' },
    { key: 'account', label: 'Account' },
    { key: 'accountName', label: 'Account Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    // { key: 'transactionType', label: 'Transaction Type' },
  ];

  const fetchMetadata = () => {
    return {
      columnsType: [
        { key: 'amount', type: 'number' },
        { key: 'date', type: 'date' },
      ],
      columnsDisplay: [
        { key: 'name', label: 'Name' },
        { key: 'accountName', label: 'Account Name' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date', format: 'dd-MM-yyyy - hh:mm' },
        { key: 'transactionType', label: 'Transaction Type' },
        { key: 'creditCardNumber', label: 'Credit Card Number' },
        { key: 'account', label: 'Account' },
      ],
    };
  };

  const dados = fetchDatasource();
  const filters = fetchFilters();
  const columns = fetchColumns();
  const meta = fetchMetadata();

  const secondGlaceRender = () => {
    return <div>Hello</div>;
  };

  return (
    <MyTable
      dataSource={dados}
      width={800}
      height={850}
      columnsToDisplay={columns}
      filterSort={filters}
      metadata={meta}
      // secondGlanceRender={secondGlaceRender}
      // lineSelectable={true}
    />
  );
  // filterSort={filters}
}

export default App;
