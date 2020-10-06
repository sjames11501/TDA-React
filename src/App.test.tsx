import React from 'react';
import { shallow } from 'enzyme';
import App from './App';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });

describe('My Test Suite', () => {
  test('Navbar should contain links', () => {
    let headerLinkProp = [
      { title: "Home", location: "/Home" },
      { title: "Scanner", location: "/Scanner" },
      { title: "Settings", location: "/Settings" }]

      const wrapper = shallow(<App />);

    expect(wrapper.find('ul').children()).toHaveLength(headerLinkProp.length);
    wrapper.find('.nav-link').forEach((node, index) => {
      expect(node.text()).toBe(headerLinkProp[index].title);
      expect(node.prop('to')).toBe(headerLinkProp[index].location);
    });
  });
});




