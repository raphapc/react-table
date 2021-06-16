import faker from 'faker';
import React from 'react';
import NesTable from './components/my-table/NesTable';
import moment from 'moment';

function App() {
  const fetchDatasource = () =>
    new Array(100).fill(true).map(() => ({
      accountName: faker.finance.accountName(),
      name: faker.name.findName(),
      amount: faker.finance.amount(),
      transactionType: faker.finance.transactionType(),
      transactionDescription: faker.finance.transactionDescription(),
      date: faker.date.past(),
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
    { key: 'transactionType', label: 'Transaction Type' },
  ];

  const fetchMetadata = () => {
    return {
      columnsType: [
        { key: 'amount', type: 'number' },
        { key: 'date', type: 'date', format: 'DD-MM-yyyy - HH:mm' },
      ],
      columnsDisplay: [
        { key: 'name', label: 'Name' },
        { key: 'accountName', label: 'Account Name' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
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

  const secondGlaceRender = (rowData) => {
    return (
      // <>
      //   <label>
      //     <b>Description:</b> {rowData.transactionDescription}
      //   </label>
      //   <br />
      //   <label>
      //     <b>Amount: </b>
      //     {rowData.amount}
      //   </label>
      //   <br />
      //   <label>
      //     <b>Date: </b>
      //     {moment(rowData.date).format('DD/MM/YYYY')}
      //   </label>
      // </>
      <NesTable
        dataSource={dados}
        // width={1200}
        // height={400}
        columnsToDisplay={columns}
        filterSort={filters}
        sorteableHeader={true}
        metadata={meta}
        secondGlanceRenderer={thridGlance}
        secondGlanceHeight={80}
        // lineSelectable={true}
        // onRowSelected={selectedRow}
        small
        // hasDropdown={false}
      />
    );
  };

  const thridGlance = (rowData) => (
    <>
      <label>
        <b>Description:</b> {rowData.transactionDescription}
      </label>
      <br />
      <label>
        <b>Amount: </b>
        {rowData.amount}
      </label>
      <br />
      <label>
        <b>Date: </b>
        {moment(rowData.date).format('DD/MM/YYYY')}
      </label>
    </>
  );

  const selectedRow = (selectedRows) => {
    console.log('selectedRows', selectedRows);
  };

  return (
    <div className="app">
      <NesTable
        dataSource={dados}
        // width={1200}
        // height={650}
        columnsToDisplay={columns}
        filterSort={filters}
        sorteableHeader={false}
        metadata={meta}
        // tableClassName='testTable'
        // cellClassName='testCell'
        // headerClassName='testHeader'
        secondGlanceRenderer={secondGlaceRender}
        secondGlanceHeight={400}
        lineSelectable={true}
        // onRowSelected={selectedRow}
        // small
        // hasDropdown={true}
      />
    </div>
  );
}

export default App;
