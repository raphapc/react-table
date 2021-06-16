import React from 'react';
import faker from 'faker';
import NesTable from './NesTable';
import 'antd/dist/antd.css';
import './rv.css'

const _fetchDatasource = () =>
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

const _fetchMetadata = () => {
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

const _fetchColumns = () => [
  { key: 'name', label: 'Name' },
  { key: 'account', label: 'Account' },
  { key: 'accountName', label: 'Account Name' },
  { key: 'amount', label: 'Amount' },
  { key: 'date', label: 'Date' },
  { key: 'transactionType', label: 'Transaction Type' },
];

const _fetchFilters = () => {
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

const _dataSource = _fetchDatasource();
const _filters = _fetchFilters();
const _columns = _fetchColumns();
const _meta = _fetchMetadata();

export default {
  title: 'Nes-UI/Data Display/NesTable',
  component: NesTable,
  args: { dataSource: _dataSource, metadata: _meta, filterSort: _filters, columnsToDisplay: _columns,},
};

const _Template = args => <div style={{height: '90vh', display: 'block'}}><NesTable {...args} /></div>;

export const SimpleTable = _Template.bind({});
// SimpleTable.name = 'Simple Table';
